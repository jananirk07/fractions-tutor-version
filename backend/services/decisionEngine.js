function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function rateQuestionForDifficulty(q, targetDifficulty) {
  return Math.abs((q.difficulty || 1) - targetDifficulty);
}

function kcStats(history, kc) {
  const kcHistory = (history || []).filter((h) => h.kc === kc);
  const recent = kcHistory.slice(-5);
  if (!recent.length) return { accuracy: 0.5, avgHints: 0, avgAttempts: 1, avgTime: null };
  const correctCount = recent.filter((h) => h.correct).length;
  const hintSum = recent.reduce((s, h) => s + (h.hints_used || 0), 0);
  const attemptSum = recent.reduce((s, h) => s + (h.attempts || 1), 0);
  const timings = recent.map((h) => h.time_taken).filter((t) => typeof t === "number" && t > 0);
  const avgTime = timings.length ? timings.reduce((a, b) => a + b, 0) / timings.length : null;
  return {
    accuracy: correctCount / recent.length,
    avgHints: hintSum / recent.length,
    avgAttempts: attemptSum / recent.length,
    avgTime, // ms
  };
}

const ALL_KCS = ["KC1", "KC2", "KC3", "KC4", "KC5", "KC6", "KC7"];

function selectTargetKC({ mastery, history }) {
  const master = mastery || {};
  const lowestMasteryKC = ALL_KCS.reduce(
    (best, kc) => ((master[kc] ?? 0) < (master[best] ?? 0) ? kc : best),
    "KC1"
  );
  if ((master[lowestMasteryKC] ?? 0) < 65) return lowestMasteryKC;

  return ALL_KCS.reduce((best, kc) => {
    const a = kcStats(history, kc).accuracy;
    const b = kcStats(history, best).accuracy;
    return a < b ? kc : best;
  }, "KC1");
}

function chooseNextQuestion({
  mastery,
  answeredQuestionIds,
  questions,
  history = [],
  remediation = null,
  activeKC = null,
}) {
  const targetKC = activeKC || remediation?.kc || selectTargetKC({ mastery, history });
  const kcCandidates = questions.filter((q) => q.kc === targetKC);
  const candidates = remediation?.code
    ? kcCandidates.filter((q) => (q.remediationTags || []).includes(remediation.code))
    : kcCandidates;

  const unattempted = candidates.filter((q) => !answeredQuestionIds.includes(q.id));
  const pool =
    unattempted.length > 0 ? unattempted : candidates.length > 0 ? candidates : kcCandidates;

  const m = mastery?.[targetKC] ?? 0;
  const stats = kcStats(history, targetKC);

  // ── Mastery-based difficulty ──────────────────────────────────────────────
  let targetDifficulty;
  if (m < 30) {
    targetDifficulty = 1;
  } else if (m < 60) {
    targetDifficulty = 2;
  } else {
    targetDifficulty = 3;
  }

  // ── Accuracy / hint adjustments ───────────────────────────────────────────
  if (stats.accuracy < 0.55 || stats.avgHints >= 1.5 || stats.avgAttempts > 1.2) {
    targetDifficulty -= 1;
  }
  if (stats.accuracy > 0.85 && stats.avgHints < 0.8) {
    targetDifficulty += 1;
  }

  // ── Response time adjustment ──────────────────────────────────────────────
  if (stats.avgTime !== null) {
    const avgSec = stats.avgTime / 1000;
    if (avgSec < 15 && stats.accuracy >= 0.6) {
      // Fast AND mostly correct → increase difficulty
      targetDifficulty += 1;
    } else if (avgSec > 45 && stats.accuracy < 0.5) {
      // Slow AND mostly wrong → decrease difficulty
      targetDifficulty -= 1;
    }
  }

  targetDifficulty = clamp(targetDifficulty, 1, 3);

  let best = pool[0];
  for (const q of pool) {
    if (!best) { best = q; continue; }
    const dBest = rateQuestionForDifficulty(best, targetDifficulty);
    const dQ = rateQuestionForDifficulty(q, targetDifficulty);
    if (dQ < dBest) best = q;
    if (dQ === dBest && String(q.id) < String(best.id)) best = q;
  }

  return best;
}

module.exports = {
  chooseNextQuestion,
  selectTargetKC,
};
