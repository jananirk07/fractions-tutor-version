import { create } from "zustand";
import { api } from "../lib/api";

const ALL_KCS = ["KC1", "KC2", "KC3", "KC4", "KC5", "KC6", "KC7"];

const KC_TITLES = {
  KC1: "KC1: Parts of a Fraction",
  KC2: "KC2: Unit Fractions",
  KC3: "KC3: Visual Matching",
  KC4: "KC4: Number Line",
  KC5: "KC5: Recognizing Equivalence",
  KC6: "KC6: Generating Equivalence",
  KC7: "KC7: Compare Same Denominator",
};

const emptyQuestion = null;

const useTutorStore = create((set, get) => ({
  student_id: null,
  name: "",

  mastery: Object.fromEntries(ALL_KCS.map((k) => [k, 20])),
  profile: null,

  currentQuestion: emptyQuestion,

  hintLevel: 0,
  hintTexts: [],

  feedback: null,

  status: "idle",
  error: null,

  // ── New fields ────────────────────────────────────────────────────────────
  // Active KC the student is currently working on
  activeKC: "KC1",

  // Lesson phase: "lesson" | "questions"
  lessonPhase: "lesson",

  // Lesson content loaded from backend: { KC1: { title, explanation, example }, ... }
  lessons: {},

  // Which KCs the student has already seen the lesson for (this session)
  lessonsViewed: [],

  // Persisted question states: { [question_id]: "correct"|"incorrect"|"skipped"|"unvisited" }
  questionStates: {},

  // All questions list (pre-loaded)
  allQuestions: [],

  // KC_TITLES map (exposed for consumers)
  KC_TITLES,
  ALL_KCS,
  // ─────────────────────────────────────────────────────────────────────────

  startSession: async (name) => {
    set({ status: "loading", error: null });
    const safeName = encodeURIComponent((name || "Student").trim());
    const data = await api.get(`/api/start-session?name=${safeName}`);

    set({
      student_id: data.student_id,
      name: data.name || name || "Student",
      mastery: data.mastery,
      questionStates: data.questionStates || {},
      lessonsViewed: data.lessonsViewed || [],
      status: "ready",
    });
  },

  fetchProgress: async () => {
    const { student_id } = get();
    if (!student_id) return;
    set({ status: "loading", error: null });
    const data = await api.get(`/api/progress?student_id=${encodeURIComponent(student_id)}`);
    set({
      mastery: data.mastery,
      profile: data,
      name: data.name || get().name,
      questionStates: data.questionStates || get().questionStates,
      status: "ready",
    });
  },

  fetchQuestionsList: async () => {
    const data = await api.get("/api/questions");
    const qs = data.questions || [];
    set({ allQuestions: qs });
    return qs;
  },

  fetchLessons: async () => {
    try {
      const data = await api.get("/api/lessons");
      set({ lessons: data.lessons || {} });
      return data.lessons || {};
    } catch {
      return {};
    }
  },

  markLessonViewed: async (kc) => {
    const { student_id, lessonsViewed } = get();
    if (lessonsViewed.includes(kc)) return;
    const next = [...lessonsViewed, kc];
    set({ lessonsViewed: next });
    if (student_id) {
      try {
        await api.post("/api/mark-lesson-viewed", { student_id, kc });
      } catch {
        // non-blocking
      }
    }
  },

  setActiveKC: (kc) => {
    const { lessonsViewed } = get();
    // If student has already seen this lesson, skip directly to questions
    const phase = lessonsViewed.includes(kc) ? "questions" : "lesson";
    set({ activeKC: kc, lessonPhase: phase, feedback: null, hintTexts: [], hintLevel: 0 });
  },

  setLessonPhase: (phase) => set({ lessonPhase: phase }),

  fetchNextQuestion: async () => {
    const { student_id, activeKC } = get();
    if (!student_id) throw new Error("Missing student_id");

    set({ status: "loading", feedback: null, hintTexts: [], hintLevel: 0 });
    const data = await api.get(
      `/api/next-question?student_id=${encodeURIComponent(student_id)}&active_kc=${encodeURIComponent(activeKC || "KC1")}`,
    );

    set({
      currentQuestion: data.question,
      hintLevel: data.hintLevel ?? 0,
      status: "ready",
    });
  },

  setCurrentQuestion: (question) => {
    set({ currentQuestion: question });
  },

  submitAnswerForQuestion: async (question_id, selected_option, time_taken) => {
    const { student_id } = get();
    if (!student_id || !question_id) throw new Error("Missing session or question");

    set({ status: "loading", error: null });
    const data = await api.post("/api/submit-answer", {
      student_id,
      question_id,
      selected_option,
      time_taken: time_taken || null,
    });

    // Update persisted question state
    const newState = data.correct ? "correct" : "incorrect";
    set((prev) => ({
      mastery: data.updated_mastery,
      feedback: {
        ...data.feedback,
        correct: data.correct,
        misconception: data.misconception,
        remediation: data.remediation || null,
      },
      questionStates: { ...prev.questionStates, [question_id]: newState },
      status: "ready",
    }));

    return data;
  },

  submitAnswer: async (selected_option) => {
    const { student_id, currentQuestion } = get();
    if (!student_id || !currentQuestion) throw new Error("Missing session or question");

    set({ status: "loading", error: null });
    const data = await api.post("/api/submit-answer", {
      student_id,
      question_id: currentQuestion.id,
      selected_option,
    });

    const newState = data.correct ? "correct" : "incorrect";
    set((prev) => ({
      mastery: data.updated_mastery,
      feedback: {
        ...data.feedback,
        correct: data.correct,
        misconception: data.misconception,
        remediation: data.remediation || null,
      },
      questionStates: { ...prev.questionStates, [currentQuestion.id]: newState },
      status: "ready",
    }));

    return data;
  },

  saveQuestionState: async (question_id, state) => {
    const { student_id } = get();
    set((prev) => ({
      questionStates: { ...prev.questionStates, [question_id]: state },
    }));
    if (student_id) {
      try {
        await api.post("/api/save-question-states", {
          student_id,
          questionStates: { [question_id]: state },
        });
      } catch {
        // non-blocking
      }
    }
  },

  requestHintForQuestion: async (question_id) => {
    const { student_id } = get();
    if (!student_id || !question_id) throw new Error("Missing session or question");

    const data = await api.get(
      `/api/hint?student_id=${encodeURIComponent(student_id)}&question_id=${encodeURIComponent(question_id)}`,
    );

    const level = data.hintLevel ?? 1;
    const texts = [...(get().hintTexts || [])];
    texts[level - 1] = data.hintText;

    set({
      hintLevel: level,
      hintTexts: texts,
    });

    return data;
  },

  requestHint: async () => {
    const { student_id, currentQuestion } = get();
    if (!student_id || !currentQuestion) throw new Error("Missing session or question");

    const data = await api.get(
      `/api/hint?student_id=${encodeURIComponent(student_id)}&question_id=${encodeURIComponent(
        currentQuestion.id,
      )}`,
    );

    const level = data.hintLevel ?? 1;
    const texts = [...(get().hintTexts || [])];
    texts[level - 1] = data.hintText;

    set({
      hintLevel: level,
      hintTexts: texts,
    });

    return data;
  },

  resetTutor: () => {
    set({
      student_id: null,
      name: "",
      currentQuestion: emptyQuestion,
      hintLevel: 0,
      hintTexts: [],
      feedback: null,
      mastery: Object.fromEntries(ALL_KCS.map((k) => [k, 20])),
      profile: null,
      status: "idle",
      error: null,
      activeKC: "KC1",
      lessonPhase: "lesson",
      lessons: {},
      lessonsViewed: [],
      questionStates: {},
      allQuestions: [],
    });
  },
}));

export default useTutorStore;
