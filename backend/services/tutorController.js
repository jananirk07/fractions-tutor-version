const { getOrCreateStudent } = require("./db");
const { persist } = require("./db");
const { createInitialMastery } = require("./learnerModel");
const { chooseNextQuestion } = require("./decisionEngine");
const { detectMisconception } = require("./misconceptionEngine");
const questions = require("../data/questions");
const { lessons } = require("../data/questions");
const { updateMastery } = require("./learnerModel");

const ALL_KCS = ["KC1", "KC2", "KC3", "KC4", "KC5", "KC6", "KC7"];

function normalizeSelectedOption(selected_option) {
  if (Array.isArray(selected_option)) return selected_option.map((x) => String(x).trim()).sort();
  if (typeof selected_option === "boolean") return selected_option ? "true" : "false";
  return String(selected_option ?? "").trim();
}

function validateStudentId(student_id) {
  if (!student_id || typeof student_id !== "string") return false;
  return student_id.trim().length > 0;
}

// ── startSession ─────────────────────────────────────────────────────────────
// KEY FIX: Only pass mastery initial for NEW students.
// For existing students, getOrCreateStudent ignores the mastery field.
async function startSession(req, res) {
  const requestedId = req.query.student_id;
  const requestedName = req.query.name;
  const student_id = validateStudentId(requestedId) ? requestedId : null;

  const student = getOrCreateStudent(student_id, {
    mastery: createInitialMastery(),
    name:
      typeof requestedName === "string" && requestedName.trim()
        ? requestedName.trim()
        : "Student",
  });

  // Update name if provided
  if (typeof requestedName === "string" && requestedName.trim()) {
    student.name = requestedName.trim();
  }

  // Update session start time
  if (!student.metrics) {
    student.metrics = {
      session_start_time: Date.now(),
      session_end_time: null,
      time_taken_per_question: {},
      question_timestamp: {},
      misconception_frequency: { F001: 0, F002: 0, F003: 0, F004: 0 },
    };
  } else {
    student.metrics.session_start_time = Date.now();
    student.metrics.session_end_time = null;
  }

  student.current = null;
  persist();

  res.json({
    student_id: student.id,
    name: student.name,
    mastery: student.mastery,
    questionStates: student.questionStates || {},
    lessonsViewed: student.lessonsViewed || [],
    metrics: student.metrics,
  });
}

// ── nextQuestion ──────────────────────────────────────────────────────────────
async function nextQuestion(req, res) {
  const { student_id, active_kc } = req.query;
  if (!validateStudentId(student_id)) {
    return res.status(400).json({ error: "Missing or invalid student_id" });
  }

  const student = getOrCreateStudent(student_id);
  const answeredQuestionIds = student.history?.map((h) => h.question_id) || [];

  const question = chooseNextQuestion({
    mastery: student.mastery,
    answeredQuestionIds,
    questions,
    history: student.history || [],
    remediation: student.remediation,
    activeKC: active_kc || null,
  });

  student.current = {
    question_id: question.id,
    hintLevel: 0,
    hintsUsed: 0,
    attempts: 0,
    startedAt: Date.now(),
  };
  student.remediation = null;
  persist();

  res.json({
    question: {
      id: question.id,
      prompt: question.prompt,
      visual: question.visual,
      visual2: question.visual2 || null,
      type: question.type || "mcq",
      kc: question.kc,
      difficulty: question.difficulty,
      explanationCorrect: question.explanationCorrect,
      options: question.options,
      statement: question.statement || null,
    },
    hintLevel: 0,
  });
}

function evaluateQuestionAnswer(question, normalized) {
  const type = question.type || "mcq";
  if (type === "fill_blank") {
    return normalized.toLowerCase() === String(question.correct_text || "").trim().toLowerCase();
  }
  if (type === "true_false") {
    const target = String(Boolean(question.correct_boolean));
    return normalized === target;
  }
  if (type === "multi_select") {
    const given = Array.isArray(normalized) ? normalized : [normalized];
    const expected = (question.correct_options || []).map((x) => String(x)).sort();
    if (given.length !== expected.length) return false;
    return expected.every((v, i) => given.sort()[i] === v);
  }
  return normalized === String(question.correct_option);
}

function recentKcAccuracy(history, kc) {
  const recent = (history || []).filter((h) => h.kc === kc).slice(-5);
  if (!recent.length) return 0.5;
  return recent.filter((h) => h.correct).length / recent.length;
}

function recommendationFromMastery(mastery) {
  const entries = Object.entries(mastery || {});
  if (!entries.length) return null;
  const weakest = entries.reduce((w, e) => (e[1] < w[1] ? e : w), entries[0]);
  return `Focus more on ${weakest[0]} with guided hints and visual practice.`;
}

// ── submitAnswer ──────────────────────────────────────────────────────────────
async function submitAnswer(req, res) {
  const { student_id, question_id, selected_option, time_taken } = req.body || {};
  if (!validateStudentId(student_id)) {
    return res.status(400).json({ error: "Missing or invalid student_id" });
  }
  if (!question_id || typeof question_id !== "string") {
    return res.status(400).json({ error: "Missing question_id" });
  }

  const student = getOrCreateStudent(student_id);
  const question = questions.find((q) => q.id === question_id);
  if (!question) {
    return res.status(404).json({ error: "Unknown question_id" });
  }

  const normalized = normalizeSelectedOption(selected_option);
  const correct = evaluateQuestionAnswer(question, normalized);
  const attempts = (student.current?.attempts || 0) + 1;
  if (student.current) student.current.attempts = attempts;

  const { code, misconceptionLabel } = detectMisconception({
    question,
    selectedOption: Array.isArray(normalized) ? normalized.join("|") : normalized,
    isCorrect: correct,
  });

  const hintsUsed = student.current?.hintsUsed || 0;
  const recentAccuracy = recentKcAccuracy(student.history || [], question.kc);
  const previousMastery = student.mastery?.[question.kc] ?? 0;
  const updated_mastery = updateMastery({
    mastery: student.mastery,
    kc: question.kc,
    correct,
    difficulty: question.difficulty,
    hintsUsed,
    attempts,
    recentAccuracy,
  });
  student.mastery = updated_mastery;
  const masteryDelta = (student.mastery?.[question.kc] ?? 0) - previousMastery;

  const explanation =
    correct
      ? question.explanationCorrect
      : question.explanationsByMisconception[code]?.text || question.explanationIncorrectFallback;

  // ── Persist detailed metrics ──────────────────────────────────────────────
  const now = Date.now();
  if (!student.metrics)
    student.metrics = {
      session_start_time: now,
      session_end_time: null,
      time_taken_per_question: {},
      question_timestamp: {},
      misconception_frequency: { F001: 0, F002: 0, F003: 0, F004: 0 },
    };

  // Time taken for this question
  if (typeof time_taken === "number" && time_taken > 0) {
    student.metrics.time_taken_per_question[question_id] = time_taken;
  } else if (student.current?.startedAt) {
    student.metrics.time_taken_per_question[question_id] = now - student.current.startedAt;
  }
  student.metrics.question_timestamp[question_id] = now;

  // Misconception frequency
  if (!correct && code) {
    const freq = student.metrics.misconception_frequency || {};
    freq[code] = (freq[code] || 0) + 1;
    student.metrics.misconception_frequency = freq;
  }
  // ─────────────────────────────────────────────────────────────────────────

  student.history = student.history || [];
  student.history.push({
    timestamp: now,
    question_id: question.id,
    kc: question.kc,
    selected_option: normalized,
    correct,
    misconception: code || null,
    hints_used: hintsUsed,
    attempts,
    updated_mastery: updated_mastery,
    time_taken: student.metrics.time_taken_per_question[question_id] || null,
  });

  // ── Persist question state ────────────────────────────────────────────────
  if (!student.questionStates) student.questionStates = {};
  student.questionStates[question_id] = correct ? "correct" : "incorrect";
  // ─────────────────────────────────────────────────────────────────────────

  if (student.current?.question_id === question_id) {
    student.current.hintLevel = 0;
    student.current.hintsUsed = 0;
    student.current.attempts = 0;
  }

  // Remediation trigger: same misconception appears twice in last 5 attempts.
  let remediation = null;
  if (!correct && code) {
    const recentSame = student.history
      .slice(-5)
      .filter((h) => h.kc === question.kc && h.misconception === code).length;
    if (recentSame >= 2) {
      remediation = {
        kc: question.kc,
        code,
        message: `We noticed repeated ${code}. Let's do a quick correction cycle.`,
        visualCorrection: question.visual || null,
        targetedExplanation:
          question.explanationsByMisconception?.[code]?.text ||
          "Use the hint ladder and compare numerator/denominator carefully.",
      };
      student.remediation = remediation;
    }
  }

  persist();

  res.json({
    correct,
    misconception: code || null,
    updated_mastery,
    remediation,
    feedback: {
      message: correct ? question.feedbackCorrect : question.feedbackIncorrect,
      explanation,
      misconceptionLabel: code ? misconceptionLabel : null,
      outcomeSummary: correct
        ? "You applied the concept correctly. This strengthens your mastery on this KC."
        : "Your answer indicates a gap in the current concept, so the tutor will adapt support.",
      strategyTip: correct
        ? "Try to explain why your answer is correct before moving on."
        : "Use the hint ladder and compare part-to-whole carefully before your next attempt.",
      nextStep: correct
        ? "Move to the next question or revisit an unattempted one from the left panel."
        : "Revisit this concept with hints, then attempt another related question.",
      masteryImpact: `Mastery change on ${question.kc}: ${masteryDelta >= 0 ? "+" : ""}${masteryDelta}`,
    },
  });
}

// ── getHint ───────────────────────────────────────────────────────────────────
async function getHint(req, res) {
  const { student_id, question_id } = req.query;
  if (!validateStudentId(student_id)) {
    return res.status(400).json({ error: "Missing or invalid student_id" });
  }
  if (!question_id || typeof question_id !== "string") {
    return res.status(400).json({ error: "Missing question_id" });
  }

  const student = getOrCreateStudent(student_id);
  const question = questions.find((q) => q.id === question_id);
  if (!question) return res.status(404).json({ error: "Unknown question_id" });

  // Ensure current question matches; otherwise treat as level 0
  if (!student.current || student.current.question_id !== question_id) {
    student.current = { question_id, hintLevel: 0, hintsUsed: 0, attempts: 0, startedAt: Date.now() };
  }

  const maxHints = (question.hints || []).length;
  const nextLevel = Math.min(maxHints, (student.current.hintLevel || 0) + 1);
  student.current.hintLevel = nextLevel;
  student.current.hintsUsed = (student.current.hintsUsed || 0) + 1;

  const hintText = question.hints[nextLevel - 1] || "";

  persist();

  res.json({
    question_id,
    hintLevel: nextLevel,
    hintText,
    maxHints,
  });
}

// ── getProgress ───────────────────────────────────────────────────────────────
async function getProgress(req, res) {
  const { student_id } = req.query;
  if (!validateStudentId(student_id)) {
    return res.status(400).json({ error: "Missing or invalid student_id" });
  }

  const student = getOrCreateStudent(student_id);
  const history = student.history || [];
  const strongAreas = Object.entries(student.mastery || {})
    .filter(([, value]) => value >= 75)
    .map(([kc]) => kc);
  const weakAreas = Object.entries(student.mastery || {})
    .filter(([, value]) => value < 60)
    .map(([kc]) => kc);
  const chart = ALL_KCS.map((kc) => {
    const kcHistory = history.filter((h) => h.kc === kc);
    const correct = kcHistory.filter((h) => h.correct).length;
    return {
      kc,
      mastery: student.mastery?.[kc] || 0,
      attempts: kcHistory.length,
      accuracy: kcHistory.length ? Math.round((correct / kcHistory.length) * 100) : 0,
      hints: kcHistory.reduce((s, h) => s + (h.hints_used || 0), 0),
    };
  });

  res.json({
    student_id: student.id,
    name: student.name,
    mastery: student.mastery,
    historyCount: history.length,
    strongAreas,
    weakAreas,
    recommendation: recommendationFromMastery(student.mastery),
    chart,
    questionStates: student.questionStates || {},
    metrics: student.metrics || {},
  });
}

// ── getQuestions ──────────────────────────────────────────────────────────────
async function getQuestions(req, res) {
  const payload = questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    visual: question.visual,
    visual2: question.visual2 || null,
    type: question.type || "mcq",
    kc: question.kc,
    difficulty: question.difficulty,
    explanationCorrect: question.explanationCorrect,
    options: question.options || null,
    statement: question.statement || null,
  }));

  res.json({ questions: payload });
}

// ── getLessons ────────────────────────────────────────────────────────────────
async function getLessons(req, res) {
  res.json({ lessons });
}

// ── saveQuestionStates ────────────────────────────────────────────────────────
async function saveQuestionStates(req, res) {
  const { student_id, questionStates } = req.body || {};
  if (!validateStudentId(student_id)) {
    return res.status(400).json({ error: "Missing or invalid student_id" });
  }

  const student = getOrCreateStudent(student_id);
  if (!student.questionStates) student.questionStates = {};

  // Merge: only update states that are meaningful (correct/incorrect/skipped override unvisited)
  if (questionStates && typeof questionStates === "object") {
    for (const [qid, state] of Object.entries(questionStates)) {
      student.questionStates[qid] = state;
    }
  }

  persist();
  res.json({ ok: true, questionStates: student.questionStates });
}

// ── markLessonViewed ─────────────────────────────────────────────────────────
async function markLessonViewed(req, res) {
  const { student_id, kc } = req.body || {};
  if (!validateStudentId(student_id)) {
    return res.status(400).json({ error: "Missing or invalid student_id" });
  }

  const student = getOrCreateStudent(student_id);
  if (!student.lessonsViewed) student.lessonsViewed = [];
  if (!student.lessonsViewed.includes(kc)) {
    student.lessonsViewed.push(kc);
  }

  persist();
  res.json({ ok: true, lessonsViewed: student.lessonsViewed });
}

module.exports = {
  startSession,
  nextQuestion,
  submitAnswer,
  getHint,
  getProgress,
  getQuestions,
  getLessons,
  saveQuestionStates,
  markLessonViewed,
};
