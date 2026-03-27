import React from "react";
import { useNavigate } from "react-router-dom";
import useTutorStore from "../store/useTutorStore.js";
import QuestionCard from "../components/QuestionCard.jsx";
import HintBox from "../components/HintBox.jsx";
import { motion, AnimatePresence } from "framer-motion";

// ── KC selector tabs ──────────────────────────────────────────────────────────
function KCTabs({ activeKC, allKCs, kcTitles, onSelect }) {
  return (
    <div className="mb-3 flex flex-wrap gap-1">
      {allKCs.map((kc) => (
        <button
          key={kc}
          type="button"
          onClick={() => onSelect(kc)}
          className={[
            "rounded-lg border px-2 py-1 text-xs font-semibold transition",
            kc === activeKC
              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
          ].join(" ")}
        >
          {kc}
        </button>
      ))}
    </div>
  );
}

// ── Lesson Card ───────────────────────────────────────────────────────────────
function LessonCard({ lesson, onStart }) {
  if (!lesson) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm"
    >
      <div className="text-xs font-bold uppercase tracking-wide text-indigo-500">Lesson</div>
      <div className="mt-1 text-lg font-extrabold text-indigo-900">{lesson.title}</div>

      <div className="mt-3 rounded-xl bg-white p-4 text-sm text-slate-700 leading-relaxed border border-indigo-100">
        {lesson.explanation}
      </div>

      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Example</div>
        <div className="mt-1 text-sm text-emerald-900">{lesson.example}</div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition"
      >
        Start Questions →
      </button>
    </motion.div>
  );
}

export default function Tutor() {
  const navigate = useNavigate();

  const name = useTutorStore((s) => s.name);
  const currentQuestion = useTutorStore((s) => s.currentQuestion);
  const mastery = useTutorStore((s) => s.mastery);
  const hintLevel = useTutorStore((s) => s.hintLevel);
  const hintTexts = useTutorStore((s) => s.hintTexts);
  const feedback = useTutorStore((s) => s.feedback);
  const status = useTutorStore((s) => s.status);
  const error = useTutorStore((s) => s.error);

  // New state
  const activeKC = useTutorStore((s) => s.activeKC);
  const lessonPhase = useTutorStore((s) => s.lessonPhase);
  const lessons = useTutorStore((s) => s.lessons);
  const lessonsViewed = useTutorStore((s) => s.lessonsViewed);
  const questionStates = useTutorStore((s) => s.questionStates);
  const allQuestions = useTutorStore((s) => s.allQuestions);
  const KC_TITLES = useTutorStore((s) => s.KC_TITLES);
  const ALL_KCS = useTutorStore((s) => s.ALL_KCS);

  const fetchNextQuestion = useTutorStore((s) => s.fetchNextQuestion);
  const fetchQuestionsList = useTutorStore((s) => s.fetchQuestionsList);
  const fetchLessons = useTutorStore((s) => s.fetchLessons);
  const submitAnswerForQuestion = useTutorStore((s) => s.submitAnswerForQuestion);
  const requestHintForQuestion = useTutorStore((s) => s.requestHintForQuestion);
  const setCurrentQuestion = useTutorStore((s) => s.setCurrentQuestion);
  const setActiveKC = useTutorStore((s) => s.setActiveKC);
  const setLessonPhase = useTutorStore((s) => s.setLessonPhase);
  const markLessonViewed = useTutorStore((s) => s.markLessonViewed);
  const saveQuestionState = useTutorStore((s) => s.saveQuestionState);

  // Local UI state
  const [questionMap, setQuestionMap] = React.useState({});
  const [activeQuestionId, setActiveQuestionId] = React.useState(null);
  const [selectedByQuestion, setSelectedByQuestion] = React.useState({});
  const [attemptStateByQuestion, setAttemptStateByQuestion] = React.useState({});
  const [feedbackByQuestion, setFeedbackByQuestion] = React.useState({});
  const [hintsByQuestion, setHintsByQuestion] = React.useState({});
  const [hintLoading, setHintLoading] = React.useState(false);
  const [hintError, setHintError] = React.useState(null);
  const [questionStartTime, setQuestionStartTime] = React.useState(null);

  // Questions filtered to active KC
  const kcQuestionOrder = React.useMemo(() => {
    return allQuestions.filter((q) => q.kc === activeKC).map((q) => q.id);
  }, [allQuestions, activeKC]);

  const activeQuestion = activeQuestionId ? questionMap[activeQuestionId] : currentQuestion;
  const activeFeedback = activeQuestionId ? feedbackByQuestion[activeQuestionId] || null : feedback;
  const activeHintState = activeQuestionId
    ? hintsByQuestion[activeQuestionId] || { hintLevel: 0, hintTexts: [] }
    : { hintLevel, hintTexts };
  const activeAttemptState = activeQuestionId
    ? attemptStateByQuestion[activeQuestionId] || { attempted: false }
    : { attempted: false };

  // Sync persisted questionStates into local attemptStateByQuestion on load
  React.useEffect(() => {
    if (!questionStates || Object.keys(questionStates).length === 0) return;
    setAttemptStateByQuestion((prev) => {
      const next = { ...prev };
      for (const [qid, state] of Object.entries(questionStates)) {
        if (!next[qid]) {
          next[qid] = {
            attempted: state === "correct" || state === "incorrect",
            correct: state === "correct" ? true : state === "incorrect" ? false : null,
            skipped: state === "skipped",
          };
        }
      }
      return next;
    });
  }, [questionStates]);

  const registerQuestion = React.useCallback(
    (question, initialHintLevel = 0) => {
      if (!question?.id) return;
      setQuestionMap((prev) => ({ ...prev, [question.id]: question }));
      setHintsByQuestion((prev) => {
        if (prev[question.id]) return prev;
        return { ...prev, [question.id]: { hintLevel: initialHintLevel, hintTexts: [] } };
      });
      setAttemptStateByQuestion((prev) => {
        if (prev[question.id]) return prev;
        // Check persisted state
        const persisted = questionStates?.[question.id];
        if (persisted) {
          return {
            ...prev,
            [question.id]: {
              attempted: persisted === "correct" || persisted === "incorrect",
              correct: persisted === "correct" ? true : persisted === "incorrect" ? false : null,
              skipped: persisted === "skipped",
            },
          };
        }
        return { ...prev, [question.id]: { attempted: false, correct: null } };
      });
      setActiveQuestionId(question.id);
      setCurrentQuestion(question);
      setQuestionStartTime(Date.now());
    },
    [setCurrentQuestion, questionStates],
  );

  const markCurrentAsSkippedIfUnattempted = React.useCallback(() => {
    if (!activeQuestionId) return;
    const state = attemptStateByQuestion[activeQuestionId] || {
      attempted: false,
      correct: null,
      skipped: false,
    };
    if (state.attempted || state.skipped) return;
    setAttemptStateByQuestion((prev) => ({
      ...prev,
      [activeQuestionId]: {
        ...(prev[activeQuestionId] || { attempted: false, correct: null }),
        skipped: true,
      },
    }));
    saveQuestionState(activeQuestionId, "skipped");
  }, [activeQuestionId, attemptStateByQuestion, saveQuestionState]);

  const registerQuestionList = React.useCallback(
    (questions) => {
      const qMap = {};
      for (const q of questions || []) {
        if (!q?.id) continue;
        qMap[q.id] = q;
      }
      setQuestionMap(qMap);

      setHintsByQuestion((prev) => {
        const next = { ...prev };
        for (const q of questions || []) {
          if (!next[q.id]) next[q.id] = { hintLevel: 0, hintTexts: [] };
        }
        return next;
      });

      setAttemptStateByQuestion((prev) => {
        const next = { ...prev };
        for (const q of questions || []) {
          if (!next[q.id]) {
            const persisted = questionStates?.[q.id];
            if (persisted) {
              next[q.id] = {
                attempted: persisted === "correct" || persisted === "incorrect",
                correct: persisted === "correct" ? true : persisted === "incorrect" ? false : null,
                skipped: persisted === "skipped",
              };
            } else {
              next[q.id] = { attempted: false, correct: null, skipped: false };
            }
          }
        }
        return next;
      });
    },
    [questionStates],
  );

  // Initial load
  React.useEffect(() => {
    Promise.all([fetchQuestionsList(), fetchLessons(), fetchNextQuestion()]).then(
      ([allQs]) => {
        registerQuestionList(allQs);
        const q = useTutorStore.getState().currentQuestion;
        if (q?.id && allQs?.some((x) => x.id === q.id)) {
          registerQuestion(q, 0);
        } else {
          // Pick first question of active KC
          const kcFirst = allQs?.find((x) => x.kc === activeKC);
          if (kcFirst) registerQuestion(kcFirst, 0);
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When active KC changes, reset view and set first question of that KC
  const prevKCRef = React.useRef(activeKC);
  React.useEffect(() => {
    if (prevKCRef.current === activeKC) return;
    prevKCRef.current = activeKC;
    const kcFirst = allQuestions.find((q) => q.kc === activeKC);
    if (kcFirst) {
      setActiveQuestionId(kcFirst.id);
      setCurrentQuestion(kcFirst);
      setQuestionStartTime(Date.now());
    }
  }, [activeKC, allQuestions, setCurrentQuestion]);

  const kc = activeQuestion?.kc;

  // Progress computation: correct answers / total KC questions
  const kcProgress = React.useMemo(() => {
    const total = kcQuestionOrder.length;
    if (total === 0) return 0;
    const correct = kcQuestionOrder.filter(
      (qid) => attemptStateByQuestion[qid]?.correct === true,
    ).length;
    return Math.round((correct / total) * 100);
  }, [kcQuestionOrder, attemptStateByQuestion]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-indigo-700">Fractions Tutor</div>
            <div className="text-2xl font-extrabold text-slate-900">
              {KC_TITLES[activeKC] || (kc ? `Working on ${kc}` : "Adaptive practice")}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
              {name || "Student"}
            </div>
            <motion.button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/profile")}
            >
              View Profile
            </motion.button>
            <motion.button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                if (!kcQuestionOrder.length) return;
                markCurrentAsSkippedIfUnattempted();
                const currentIdx = Math.max(0, kcQuestionOrder.indexOf(activeQuestionId));
                const nextIdx = (currentIdx + 1) % kcQuestionOrder.length;
                const nextId = kcQuestionOrder[nextIdx];
                const nextQuestion = questionMap[nextId];
                setActiveQuestionId(nextId);
                setCurrentQuestion(nextQuestion);
                setQuestionStartTime(Date.now());
              }}
              disabled={status === "loading" || lessonPhase === "lesson"}
            >
              Next Question
            </motion.button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error.message || String(error)}
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">

          {/* Left Panel — Question Navigator */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-800">Question Navigator</div>

              {/* KC Tabs */}
              <KCTabs
                activeKC={activeKC}
                allKCs={ALL_KCS}
                kcTitles={KC_TITLES}
                onSelect={(kc) => {
                  markCurrentAsSkippedIfUnattempted();
                  setActiveKC(kc);
                }}
              />

              {/* Progress bar for current KC */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{kcProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${kcProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  }}
                >
                  {kcQuestionOrder.map((qid, idx) => {
                    const q = questionMap[qid];
                    const state = attemptStateByQuestion[qid] || {
                      attempted: false,
                      correct: null,
                      skipped: false,
                    };
                    const isActive = qid === activeQuestionId;

                    const statusClasses =
                      !state.attempted && state.skipped
                        ? "border-orange-300 bg-orange-100 text-orange-900"
                        : !state.attempted
                        ? "border-slate-200 bg-white text-slate-900"
                        : state.correct
                        ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                        : "border-rose-300 bg-rose-100 text-rose-900";

                    return (
                      <button
                        key={qid}
                        type="button"
                        onClick={() => {
                          if (lessonPhase === "lesson") return;
                          if (qid !== activeQuestionId) {
                            markCurrentAsSkippedIfUnattempted();
                          }
                          setActiveQuestionId(qid);
                          setCurrentQuestion(q);
                          setQuestionStartTime(Date.now());
                        }}
                        className={[
                          "w-full rounded-xl border px-2 py-2 text-left transition",
                          statusClasses,
                          isActive ? "ring-2 ring-indigo-400" : "",
                          lessonPhase === "lesson" ? "opacity-50 cursor-not-allowed" : "",
                        ].join(" ")}
                      >
                        <div className="text-xs font-bold">Q{idx + 1}</div>
                        <div className="mt-1 text-[11px] font-medium">
                          {!state.attempted && state.skipped ? (
                            <span>Skipped</span>
                          ) : !state.attempted ? (
                            <span>Unvisited</span>
                          ) : state.correct ? (
                            <span>Correct</span>
                          ) : (
                            <span>Wrong</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel — Lesson or Question */}
          <div className="lg:col-span-6">

            <AnimatePresence mode="wait">
              {/* ── LESSON PHASE ── */}
              {lessonPhase === "lesson" ? (
                <LessonCard
                  key={`lesson-${activeKC}`}
                  lesson={lessons[activeKC]}
                  onStart={async () => {
                    await markLessonViewed(activeKC);
                    setLessonPhase("questions");
                  }}
                />
              ) : (
                /* ── QUESTIONS PHASE ── */
                <motion.div
                  key={`questions-${activeKC}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <QuestionCard
                    question={activeQuestion}
                    disabled={status === "loading" || Boolean(activeAttemptState.attempted)}
                    selected_option={selectedByQuestion[activeQuestionId] ?? null}
                    onSelectOption={async (opt) => {
                      if (!activeQuestionId) return;
                      if (activeAttemptState.attempted) return;
                      const timeTaken = questionStartTime ? Date.now() - questionStartTime : null;
                      setSelectedByQuestion((prev) => ({ ...prev, [activeQuestionId]: opt }));
                      try {
                        const data = await submitAnswerForQuestion(
                          activeQuestionId,
                          opt,
                          timeTaken,
                        );
                        setAttemptStateByQuestion((prev) => ({
                          ...prev,
                          [activeQuestionId]: {
                            attempted: true,
                            correct: data.correct,
                            skipped: false,
                          },
                        }));
                        setFeedbackByQuestion((prev) => ({
                          ...prev,
                          [activeQuestionId]: {
                            ...data.feedback,
                            correct: data.correct,
                            misconception: data.misconception,
                            remediation: data.remediation || null,
                          },
                        }));
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  />

                  <AnimatePresence mode="wait">
                    {activeFeedback ? (
                      <motion.div
                        key={`${activeQuestionId}-${activeFeedback?.message}`}
                        className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                      >
                        <div
                          className={[
                            "font-bold",
                            activeFeedback.correct ? "text-emerald-700" : "text-rose-700",
                          ].join(" ")}
                        >
                          {activeFeedback.correct ? "Correct!" : "Not quite."}
                        </div>

                        <div className="mt-2 text-sm text-slate-700">{activeFeedback.message}</div>

                        {activeFeedback.misconceptionLabel ? (
                          <div className="mt-2 text-xs font-semibold text-slate-700">
                            Misconception: {activeFeedback.misconceptionLabel}
                          </div>
                        ) : null}

                        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                          {activeFeedback.explanation}
                        </div>
                        <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-900">
                          <div className="font-semibold">What this means</div>
                          <div className="mt-1">
                            {activeFeedback.outcomeSummary ||
                              "Your attempt has been recorded and used to personalize next questions."}
                          </div>
                          <div className="mt-2 font-semibold">What to do next</div>
                          <div className="mt-1">
                            {activeFeedback.nextStep ||
                              "Use a hint and then try a similar problem."}
                          </div>
                          <div className="mt-2 text-xs text-indigo-700">
                            {activeFeedback.strategyTip ||
                              "Tip: verify denominator first, then numerator."}
                          </div>
                          {activeFeedback.masteryImpact ? (
                            <div className="mt-2 text-xs font-semibold text-indigo-800">
                              {activeFeedback.masteryImpact}
                            </div>
                          ) : null}
                        </div>

                        {activeFeedback.remediation ? (
                          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            <div className="font-semibold">
                              {activeFeedback.remediation.message}
                            </div>
                            <div className="mt-1">
                              {activeFeedback.remediation.targetedExplanation}
                            </div>
                          </div>
                        ) : null}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel — Hints + KC Mastery */}
          <div className="lg:col-span-3 space-y-4">
            <HintBox
              hintTexts={activeHintState.hintTexts}
              hintLevel={activeHintState.hintLevel}
              loading={hintLoading}
              error={hintError}
              maxHints={3}
              onRequestHint={async () => {
                if (!activeQuestionId || lessonPhase === "lesson") return;
                setHintLoading(true);
                setHintError(null);
                try {
                  const data = await requestHintForQuestion(activeQuestionId);
                  setHintsByQuestion((prev) => {
                    const current = prev[activeQuestionId] || { hintLevel: 0, hintTexts: [] };
                    const nextTexts = [...current.hintTexts];
                    nextTexts[data.hintLevel - 1] = data.hintText;
                    return {
                      ...prev,
                      [activeQuestionId]: {
                        hintLevel: data.hintLevel,
                        hintTexts: nextTexts,
                      },
                    };
                  });
                } catch (e) {
                  setHintError(e.message || "Could not load hint.");
                } finally {
                  setHintLoading(false);
                }
              }}
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-800">Your KC Mastery</div>
              <div className="mt-3 space-y-2">
                {ALL_KCS.map((k) => {
                  const m = mastery?.[k] ?? 0;
                  const label = m < 40 ? "Beginner" : m < 75 ? "Developing" : "Proficient";
                  const pct = Math.max(0, Math.min(100, Math.round(m)));
                  return (
                    <div key={k} className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-800">{k}</div>
                        <div className="text-xs font-semibold text-slate-600">{label}</div>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <motion.div
                          className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
