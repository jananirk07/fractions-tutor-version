const extraQuestions = require("./questions_extra");

const baseExplanations = {
  F001: { text: "F001: You may have swapped numerator and denominator or compared incorrectly." },
  F002: { text: "F002: Denominator meaning is being confused with shaded/selected parts." },
  F003: { text: "F003: Equivalent/compare rule is not applied consistently." },
  F004: { text: "F004: Recount and apply the rule step by step." },
};

function makeMcq(item) {
  return {
    type: "mcq",
    feedbackCorrect: "Great work.",
    feedbackIncorrect: "Try again by using the hint ladder.",
    explanationIncorrectFallback: "Use the definition of numerator/denominator and compare carefully.",
    explanationsByMisconception: baseExplanations,
    remediationTags: item.remediationTags || [],
    ...item,
  };
}

function makeFill(item) {
  return {
    type: "fill_blank",
    options: null,
    feedbackCorrect: "Correct numeric fraction.",
    feedbackIncorrect: "Check numerator and denominator carefully.",
    explanationsByMisconception: baseExplanations,
    remediationTags: item.remediationTags || [],
    ...item,
  };
}

function makeTF(item) {
  return {
    type: "true_false",
    options: ["True", "False"],
    feedbackCorrect: "Nice reasoning.",
    feedbackIncorrect: "Re-evaluate the statement using a common denominator.",
    explanationsByMisconception: baseExplanations,
    remediationTags: item.remediationTags || [],
    ...item,
  };
}

function makeMulti(item) {
  return {
    type: "multi_select",
    feedbackCorrect: "Excellent, you selected all valid options.",
    feedbackIncorrect: "Remember: select every option that matches the rule.",
    explanationsByMisconception: baseExplanations,
    remediationTags: item.remediationTags || [],
    ...item,
  };
}

// ─── Lesson Content per KC ────────────────────────────────────────────────────
const lessons = {
  KC1: {
    title: "KC1: Parts of a Fraction",
    explanation:
      "A fraction represents a part of a whole. It has two parts: the numerator (top number) tells how many parts are selected or shaded, and the denominator (bottom number) tells the total number of equal parts the whole is divided into.",
    example: "If a pizza is cut into 4 equal slices and you take 1 slice, the fraction is 1/4. The numerator is 1 (your slice) and the denominator is 4 (total slices).",
    keyRules: [
      "Numerator (top) = how many parts are selected or shaded",
      "Denominator (bottom) = total number of equal parts in the whole",
      "The whole must always be divided into EQUAL parts",
      "Fraction format: numerator / denominator",
    ],
    workedExample: {
      problem: "A bar is divided into 5 equal sections. 3 sections are shaded blue. What fraction is shaded?",
      steps: [
        "Step 1: Count the total equal parts → 5 (this is the denominator)",
        "Step 2: Count the shaded parts → 3 (this is the numerator)",
        "Step 3: Write as a fraction → shaded / total = 3/5",
      ],
      answer: "The fraction shaded is 3/5.",
    },
  },
  KC2: {
    title: "KC2: Unit Fractions",
    explanation:
      "A unit fraction has 1 as the numerator (e.g. 1/2, 1/3, 1/5). It represents one equal part of a whole. The larger the denominator, the smaller each part, because the whole is divided into more pieces.",
    example: "1/3 means the whole is divided into 3 equal parts, and you have 1 of them. 1/5 is smaller than 1/3 because there are more parts so each part is smaller.",
    keyRules: [
      "A unit fraction always has 1 as the numerator",
      "Larger denominator = smaller unit fraction",
      "Unit fractions are always less than 1",
      "To compare: 1/a > 1/b when a < b",
    ],
    workedExample: {
      problem: "Which is smaller: 1/3 or 1/5?",
      steps: [
        "Step 1: Both are unit fractions (numerator = 1)",
        "Step 2: Compare denominators: 3 vs 5",
        "Step 3: Larger denominator = more pieces = smaller each piece",
      ],
      answer: "1/5 is smaller because it has a larger denominator.",
    },
  },
  KC3: {
    title: "KC3: Visual Matching",
    explanation:
      "A fraction can be identified from a visual (circle, bar, number line). Count the shaded/filled parts — that is the numerator. Count all equal parts — that is the denominator. Always check that all parts are equal in size.",
    example: "A bar split into 5 equal sections with 2 shaded = 2/5. A circle split into 3 equal wedges with 1 shaded = 1/3.",
    keyRules: [
      "Shaded/filled parts → numerator",
      "Total equal parts → denominator",
      "All sections must be equal in size",
      "To compare two fractions visually: find a common denominator first",
    ],
    workedExample: {
      problem: "Which is greater: 1/2 shown in a bar or 2/3 shown in a bar?",
      steps: [
        "Step 1: Convert to a common denominator → sixths",
        "Step 2: 1/2 = 3/6, and 2/3 = 4/6",
        "Step 3: Compare numerators: 4 > 3",
      ],
      answer: "2/3 is greater because 4/6 > 3/6.",
    },
  },
  KC4: {
    title: "KC4: Number Line",
    explanation:
      "Fractions can be placed on a number line between 0 and 1. The denominator tells you how many equal spaces to divide the number line into. The numerator tells you which mark to land on. Larger numerator = further right on the line.",
    example: "For 3/4: divide 0–1 into 4 equal spaces. Count 3 spaces from 0. You land at the 3rd mark, which is 3/4.",
    keyRules: [
      "Denominator = number of equal spaces between 0 and 1",
      "Numerator = which mark to land on (counting from 0)",
      "Larger numerator → further right (closer to 1)",
      "0/n = 0 and n/n = 1 (the whole)",
    ],
    workedExample: {
      problem: "Place 2/5 on a number line from 0 to 1.",
      steps: [
        "Step 1: Denominator is 5 → divide 0-to-1 into 5 equal spaces",
        "Step 2: Numerator is 2 → count 2 marks from 0",
        "Step 3: The point at the 2nd mark is 2/5",
      ],
      answer: "2/5 is at the 2nd mark when 0-to-1 is divided into 5 equal spaces.",
    },
  },
  KC5: {
    title: "KC5: Recognizing Equivalence",
    explanation:
      "Two fractions are equivalent if they represent the same amount of the whole. You can check by cross-multiplying: a/b = c/d when a×d = b×c. Another method: simplify both fractions to lowest terms and compare.",
    example: "2/4 and 1/2 are equivalent: 2×2 = 4×1 → 4 = 4 ✓. Or simplify 2/4 ÷ 2/2 = 1/2.",
    keyRules: [
      "Equivalent fractions represent the same value",
      "Check: a/b = c/d if a×d = b×c (cross multiply)",
      "Simplify both to lowest terms and compare",
      "Scaling both parts by same number keeps value equal",
    ],
    workedExample: {
      problem: "Are 3/4 and 6/8 equivalent?",
      steps: [
        "Step 1: Cross multiply: 3×8 = 24 and 4×6 = 24",
        "Step 2: Both products are equal (24 = 24)",
        "Step 3: Or simplify 6/8 ÷ 2/2 = 3/4 ✓",
      ],
      answer: "Yes, 3/4 and 6/8 are equivalent.",
    },
  },
  KC6: {
    title: "KC6: Generating Equivalence",
    explanation:
      "You can generate an equivalent fraction by multiplying or dividing both the numerator and denominator by the same non-zero number. This does not change the value of the fraction — it only changes how it looks.",
    example: "1/3 × 4/4 = 4/12. Both represent the same portion. Also 6/9 ÷ 3/3 = 2/3.",
    keyRules: [
      "Multiply BOTH top and bottom by the same number",
      "Divide BOTH top and bottom by the same number (= simplifying)",
      "Adding/subtracting the same number does NOT create equivalence",
      "GCD helps find the simplest form",
    ],
    workedExample: {
      problem: "Generate two fractions equivalent to 2/3.",
      steps: [
        "Step 1: Multiply by 2/2: (2×2)/(3×2) = 4/6",
        "Step 2: Multiply by 5/5: (2×5)/(3×5) = 10/15",
        "Step 3: Both 4/6 and 10/15 equal 2/3",
      ],
      answer: "4/6 and 10/15 are both equivalent to 2/3.",
    },
  },
  KC7: {
    title: "KC7: Compare Same Denominator",
    explanation:
      "When two fractions have the same denominator, comparing them is simple: just compare the numerators. The larger the numerator, the larger the fraction, because both are divided into the same number of equal parts.",
    example: "3/7 vs 5/7 — same denominator (7), so compare numerators: 5 > 3, therefore 5/7 > 3/7.",
    keyRules: [
      "Same denominator = same size pieces",
      "Just compare numerators directly",
      "Bigger numerator = more pieces = bigger fraction",
      "Same numerator AND denominator = equal fractions",
    ],
    workedExample: {
      problem: "Order 4/9, 7/9, 1/9, 5/9 from least to greatest.",
      steps: [
        "Step 1: All have denominator 9 (same size pieces)",
        "Step 2: Compare only the numerators: 1, 4, 5, 7",
        "Step 3: Order numerators from smallest to largest",
      ],
      answer: "1/9, 4/9, 5/9, 7/9.",
    },
  },
};

const questions = [
  // ─── KC1: Parts of a Fraction (8) ────────────────────────────────────────
  makeMcq({ id: "KC1_Q1", kc: "KC1", difficulty: 1, prompt: "Circle has 1 of 2 parts shaded. Which fraction?", visual: { type: "circle", numerator: 1, denominator: 2 }, options: ["1/2", "2/1", "1/1", "2/2"], correct_option: "1/2", misconceptionByOption: { "2/1": { code: "F001", label: "Swapped" }, "1/1": { code: "F002", label: "Whole confusion" }, "2/2": { code: "F003", label: "Denominator confusion" } }, explanationCorrect: "1 shaded out of 2 total parts is 1/2.", hints: ["Count shaded first.", "Count total equal parts.", "Write shaded/total = 1/2."], remediationTags: ["F001", "F002"] }),
  makeMcq({ id: "KC1_Q2", kc: "KC1", difficulty: 1, prompt: "Bar has 3 of 4 parts shaded. Which fraction?", visual: { type: "bar", numerator: 3, denominator: 4 }, options: ["3/4", "4/3", "1/4", "3/3"], correct_option: "3/4", misconceptionByOption: { "4/3": { code: "F001", label: "Swapped" }, "1/4": { code: "F002", label: "Wrong numerator" }, "3/3": { code: "F003", label: "Wrong denominator" } }, explanationCorrect: "3 shaded out of 4 total gives 3/4.", hints: ["Denominator is total parts.", "Numerator is shaded parts.", "Answer is 3/4."], remediationTags: ["F001"] }),
  makeMcq({ id: "KC1_Q3", kc: "KC1", difficulty: 2, prompt: "Circle has 2 of 3 parts shaded. Which fraction?", visual: { type: "circle", numerator: 2, denominator: 3 }, options: ["2/3", "3/2", "2/2", "3/3"], correct_option: "2/3", misconceptionByOption: { "3/2": { code: "F001", label: "Swapped" }, "2/2": { code: "F002", label: "Whole confusion" }, "3/3": { code: "F003", label: "Wrong denominator" } }, explanationCorrect: "2 shaded out of 3 total is 2/3.", hints: ["Find shaded parts.", "Find total parts.", "Write 2/3."], remediationTags: ["F001", "F003"] }),
  makeFill({ id: "KC1_Q4", kc: "KC1", difficulty: 2, prompt: "Fill in: 5 shaded parts out of 8 total parts = __", correct_text: "5/8", explanationCorrect: "Fraction format is shaded/total = 5/8.", hints: ["Write numerator first.", "Total parts becomes denominator.", "Answer 5/8."] }),
  makeTF({ id: "KC1_Q5", kc: "KC1", difficulty: 2, prompt: "True or False: In 3/7, 7 means total equal parts.", correct_boolean: true, explanationCorrect: "Denominator is total equal parts.", hints: ["Look at denominator role.", "It counts total parts.", "So this is True."] }),
  makeMulti({ id: "KC1_Q6", kc: "KC1", difficulty: 3, prompt: "Select all fractions that represent 2 shaded out of 6 parts.", options: ["2/6", "1/3", "6/2", "4/6"], correct_options: ["2/6", "1/3"], explanationCorrect: "2/6 and 1/3 are equivalent.", hints: ["Think equivalent fractions.", "Simplify 2/6.", "2/6 = 1/3."] }),
  makeMcq({ id: "KC1_Q7", kc: "KC1", difficulty: 3, prompt: "A shape has 4 shaded out of 10 equal parts.", options: ["2/5", "4/10", "5/2", "10/4"], correct_option: "4/10", misconceptionByOption: { "2/5": { code: "F003", label: "Simplified but not asked form" }, "5/2": { code: "F001", label: "Swapped" }, "10/4": { code: "F001", label: "Swapped" } }, explanationCorrect: "Asked fraction from picture is 4/10.", hints: ["Use direct count.", "Do not swap numbers.", "4/10 is direct representation."] }),
  makeFill({ id: "KC1_Q8", kc: "KC1", difficulty: 1, prompt: "Fill in: numerator is 6 and denominator is 9. Fraction = __", correct_text: "6/9", explanationCorrect: "Fraction is numerator/denominator = 6/9.", hints: ["Write top number first.", "Then denominator.", "6/9."] }),

  // ─── KC2: Unit Fractions (8) ──────────────────────────────────────────────
  makeMcq({ id: "KC2_Q1", kc: "KC2", difficulty: 1, prompt: "Which fraction has 1 as the numerator?", options: ["1/4", "2/4", "4/1", "3/3"], correct_option: "1/4", misconceptionByOption: { "2/4": { code: "F002", label: "Numerator not 1" }, "4/1": { code: "F001", label: "Swapped" }, "3/3": { code: "F003", label: "Not unit fraction" } }, explanationCorrect: "A unit fraction has numerator 1. 1/4 is a unit fraction.", hints: ["Unit fraction means numerator = 1.", "Check each option's top number.", "Only 1/4 has 1 on top."] }),
  makeMcq({ id: "KC2_Q2", kc: "KC2", difficulty: 1, prompt: "Which is the smallest unit fraction shown?", options: ["1/2", "1/5", "1/3", "1/4"], correct_option: "1/5", misconceptionByOption: { "1/2": { code: "F002", label: "Larger denominator = larger fraction confusion" }, "1/3": { code: "F003", label: "Wrong ordering" }, "1/4": { code: "F003", label: "Close but wrong" } }, explanationCorrect: "1/5 is smallest: more equal parts means each part is smaller.", hints: ["Larger denominator means smaller parts.", "Compare: 1/2, 1/3, 1/4, 1/5.", "1/5 has the biggest denominator so it is smallest."] }),
  makeTF({ id: "KC2_Q3", kc: "KC2", difficulty: 1, prompt: "True or False: 1/8 is larger than 1/3.", correct_boolean: false, explanationCorrect: "1/3 > 1/8 because fewer equal parts means each is larger.", hints: ["Same numerator (1).", "Compare denominators: bigger denominator = smaller piece.", "1/8 < 1/3 so the statement is False."] }),
  makeFill({ id: "KC2_Q4", kc: "KC2", difficulty: 2, prompt: "A pizza is cut into 6 equal slices. You eat 1 slice. What unit fraction did you eat? __", correct_text: "1/6", explanationCorrect: "1 out of 6 equal parts = 1/6, the unit fraction.", hints: ["How many slices total?", "How many did you eat?", "Write 1/total = 1/6."] }),
  makeMcq({ id: "KC2_Q5", kc: "KC2", difficulty: 2, prompt: "A ribbon is split into 7 equal parts and 1 part is highlighted. What fraction is highlighted?", options: ["1/7", "7/1", "1/6", "2/7"], correct_option: "1/7", misconceptionByOption: { "7/1": { code: "F001", label: "Swapped" }, "1/6": { code: "F002", label: "Miscounted total" }, "2/7": { code: "F002", label: "Wrong numerator" } }, explanationCorrect: "1 highlighted out of 7 equal parts = 1/7.", hints: ["Count total equal parts first.", "Only 1 is highlighted.", "Write 1/7."] }),
  makeTF({ id: "KC2_Q6", kc: "KC2", difficulty: 2, prompt: "True or False: 1/4 > 1/3 because 4 > 3.", correct_boolean: false, explanationCorrect: "1/4 < 1/3. Bigger denominator makes smaller parts, so 1/4 is smaller.", hints: ["Bigger denominator = smaller fraction.", "Draw it out: 4 parts vs 3 parts.", "1/4 < 1/3. Statement is False."] }),
  makeMulti({ id: "KC2_Q7", kc: "KC2", difficulty: 3, prompt: "Select all unit fractions from the list.", options: ["1/5", "2/3", "1/9", "3/3", "1/2"], correct_options: ["1/5", "1/9", "1/2"], explanationCorrect: "Unit fractions have numerator = 1: 1/5, 1/9, 1/2.", hints: ["Look for top number = 1.", "2/3 has numerator 2.", "3/3 has numerator 3."] }),
  makeFill({ id: "KC2_Q8", kc: "KC2", difficulty: 3, prompt: "Order these unit fractions from least to greatest: 1/6, 1/2, 1/4. Write them separated by commas: __", correct_text: "1/6, 1/4, 1/2", explanationCorrect: "Larger denominator = smaller unit fraction. So order is 1/6, 1/4, 1/2.", hints: ["Bigger denominator = smaller value.", "Compare 6, 4, 2.", "Smallest first: 1/6, 1/4, 1/2."] }),

  // ─── KC3: Visual Matching (8) ─────────────────────────────────────────────
  makeMcq({ id: "KC3_Q1", kc: "KC3", difficulty: 1, prompt: "Which is greater?", visual: { type: "bar", numerator: 1, denominator: 2, label: "1/2" }, visual2: { type: "bar", numerator: 2, denominator: 3, label: "2/3" }, options: ["1/2", "2/3", "Equal", "Cannot compare"], correct_option: "2/3", misconceptionByOption: { "1/2": { code: "F001", label: "Compared poorly" }, "Equal": { code: "F003", label: "False equality" }, "Cannot compare": { code: "F004", label: "Strategy uncertainty" } }, explanationCorrect: "2/3 > 1/2 using common denominator.", hints: ["Convert to sixths.", "1/2=3/6, 2/3=4/6.", "4/6 is bigger."] }),
  makeMcq({ id: "KC3_Q2", kc: "KC3", difficulty: 2, prompt: "Which is greater?", options: ["3/4", "2/3", "Equal", "Not sure"], correct_option: "3/4", misconceptionByOption: { "2/3": { code: "F001", label: "Numerator-only comparison" }, "Equal": { code: "F003", label: "False equality" }, "Not sure": { code: "F004", label: "No strategy" } }, explanationCorrect: "3/4=9/12 and 2/3=8/12.", hints: ["Use denominator 12.", "Convert both.", "9/12 > 8/12."] }),
  makeMcq({ id: "KC3_Q3", kc: "KC3", difficulty: 3, prompt: "Compare 4/6 and 2/3.", options: ["4/6", "2/3", "Equal", "Not equal"], correct_option: "Equal", misconceptionByOption: { "4/6": { code: "F001", label: "Denominator bias" }, "2/3": { code: "F001", label: "Denominator bias" }, "Not equal": { code: "F003", label: "Missed equivalence" } }, explanationCorrect: "4/6 simplifies to 2/3.", hints: ["Simplify 4/6.", "Divide by 2.", "Equal values."] }),
  makeFill({ id: "KC3_Q4", kc: "KC3", difficulty: 2, prompt: "Fill in with >, <, or = : 5/8 __ 3/4", correct_text: "<", explanationCorrect: "5/8 = 0.625 and 3/4 = 0.75, so 5/8 < 3/4.", hints: ["Use common denominator 8.", "3/4 = 6/8.", "5/8 < 6/8."] }),
  makeFill({ id: "KC3_Q5", kc: "KC3", difficulty: 1, prompt: "Fill in with >, <, or = : 2/5 __ 2/7", correct_text: ">", explanationCorrect: "Same numerator; smaller denominator means bigger parts.", hints: ["Same numerator rule.", "Compare denominators.", "2/5 > 2/7."] }),
  makeTF({ id: "KC3_Q6", kc: "KC3", difficulty: 2, prompt: "True or False: 7/10 is greater than 2/3.", correct_boolean: true, explanationCorrect: "7/10=21/30 and 2/3=20/30.", hints: ["Use denominator 30.", "Compare numerators.", "21/30 > 20/30."] }),
  makeMulti({ id: "KC3_Q7", kc: "KC3", difficulty: 3, prompt: "Select all fractions greater than 1/2.", options: ["3/5", "4/9", "5/8", "2/5"], correct_options: ["3/5", "5/8"], explanationCorrect: "3/5 and 5/8 are above 1/2.", hints: ["Compare each to 1/2.", "Use cross multiplication.", "Select 3/5 and 5/8."] }),
  makeMcq({ id: "KC3_Q8", kc: "KC3", difficulty: 3, prompt: "Order from least to greatest.", statement: ["2/3", "3/5", "5/6"], options: ["3/5, 2/3, 5/6", "2/3, 3/5, 5/6", "5/6, 2/3, 3/5", "3/5, 5/6, 2/3"], correct_option: "3/5, 2/3, 5/6", misconceptionByOption: { "2/3, 3/5, 5/6": { code: "F003", label: "Ordering confusion" }, "5/6, 2/3, 3/5": { code: "F001", label: "Reversed order" }, "3/5, 5/6, 2/3": { code: "F003", label: "Middle/end swap" } }, explanationCorrect: "Approx values: 0.6, 0.67, 0.83.", hints: ["Convert to decimals/common denominator.", "Check each magnitude.", "Least to greatest is 3/5,2/3,5/6."] }),

  // ─── KC4: Number Line (8) ──────────────────────────────────────────────────
  makeMcq({ id: "KC4_Q1", kc: "KC4", difficulty: 1, prompt: "A number line from 0 to 1 is divided into 4 equal parts. Which fraction labels the 1st mark after 0?", options: ["1/4", "1/3", "1/2", "2/4"], correct_option: "1/4", misconceptionByOption: { "1/3": { code: "F002", label: "Wrong denominator" }, "1/2": { code: "F002", label: "Middle confusion" }, "2/4": { code: "F003", label: "Second mark not first" } }, explanationCorrect: "4 equal spaces; 1st mark = 1/4.", hints: ["How many equal parts?", "First mark after 0 = 1 out of 4.", "Answer: 1/4."] }),
  makeMcq({ id: "KC4_Q2", kc: "KC4", difficulty: 1, prompt: "On a 0-to-1 number line split into 3 equal parts, which mark shows 2/3?", options: ["The 2nd mark", "The 1st mark", "The 3rd mark", "Between 1st and 2nd"], correct_option: "The 2nd mark", misconceptionByOption: { "The 1st mark": { code: "F001", label: "1st mark = 1/3" }, "The 3rd mark": { code: "F001", label: "3rd mark = 3/3 = 1" }, "Between 1st and 2nd": { code: "F004", label: "Marks are exact positions" } }, explanationCorrect: "3 parts; 2nd mark = 2/3.", hints: ["Denominator = 3 parts.", "Numerator 2 = count 2 marks from 0.", "2nd mark = 2/3."] }),
  makeFill({ id: "KC4_Q3", kc: "KC4", difficulty: 2, prompt: "A number line from 0 to 1 has 5 equal parts. The point at the 3rd mark = __", correct_text: "3/5", explanationCorrect: "5 parts, 3rd mark = 3/5.", hints: ["Denominator = 5.", "Count 3 marks from 0.", "Write 3/5."] }),
  makeTF({ id: "KC4_Q4", kc: "KC4", difficulty: 2, prompt: "True or False: On a number line divided into 6 parts, 4/6 is closer to 1 than to 0.", correct_boolean: true, explanationCorrect: "4/6 ≈ 0.67 which is closer to 1 than to 0 (0.5).", hints: ["Convert 4/6 to decimal.", "4÷6 ≈ 0.67.", "0.67 > 0.5 so closer to 1. True."] }),
  makeMcq({ id: "KC4_Q5", kc: "KC4", difficulty: 2, prompt: "Which fraction is at the midpoint of a number line from 0 to 1?", options: ["1/2", "1/3", "2/3", "1/4"], correct_option: "1/2", misconceptionByOption: { "1/3": { code: "F002", label: "Not midpoint" }, "2/3": { code: "F003", label: "Past midpoint" }, "1/4": { code: "F002", label: "Quarter not mid" } }, explanationCorrect: "Midpoint between 0 and 1 is exactly 1/2.", hints: ["Midpoint means halfway.", "Half of 1 = 1/2.", "Answer: 1/2."] }),
  makeMulti({ id: "KC4_Q6", kc: "KC4", difficulty: 3, prompt: "Select all fractions that lie between 0 and 1/2 on a number line.", options: ["1/3", "2/3", "1/4", "3/4"], correct_options: ["1/3", "1/4"], explanationCorrect: "1/3 ≈ 0.33 and 1/4 = 0.25 are both less than 0.5.", hints: ["Convert each to decimal.", "1/2 = 0.5.", "Select values less than 0.5."] }),
  makeFill({ id: "KC4_Q7", kc: "KC4", difficulty: 3, prompt: "A number line is divided into 8 equal parts. What fraction is 3 marks from 0? __", correct_text: "3/8", explanationCorrect: "8 equal parts, 3 marks from 0 = 3/8.", hints: ["Denominator = 8.", "Numerator = marks from 0.", "3/8."] }),
  makeMcq({ id: "KC4_Q8", kc: "KC4", difficulty: 3, prompt: "Which fraction is the farthest right on a number line (closest to 1)?", options: ["3/4", "2/3", "5/8", "7/10"], correct_option: "3/4", misconceptionByOption: { "2/3": { code: "F001", label: "0.667 < 0.75" }, "5/8": { code: "F003", label: "0.625 < 0.75" }, "7/10": { code: "F003", label: "0.7 < 0.75" } }, explanationCorrect: "3/4 = 0.75 is the largest.", hints: ["Convert all to decimals.", "3/4=0.75, 2/3≈0.667, 5/8=0.625, 7/10=0.7.", "Largest decimal is farthest right."] }),

  // ─── KC5: Recognizing Equivalence (8) ─────────────────────────────────────
  makeMcq({ id: "KC5_Q1", kc: "KC5", difficulty: 1, prompt: "Which is equivalent to 1/2?", visual: { type: "circle", numerator: 1, denominator: 2 }, options: ["2/4", "1/4", "3/4", "2/2"], correct_option: "2/4", misconceptionByOption: { "1/4": { code: "F002", label: "Scaled one side" }, "3/4": { code: "F003", label: "Wrong scaling" }, "2/2": { code: "F004", label: "Not equivalent" } }, explanationCorrect: "Multiply top and bottom by 2.", hints: ["Scale both by same number.", "Try x2.", "1/2 = 2/4."], remediationTags: ["F003"] }),
  makeMcq({ id: "KC5_Q2", kc: "KC5", difficulty: 2, prompt: "Which is equivalent to 3/4?", options: ["6/8", "3/8", "4/6", "5/8"], correct_option: "6/8", misconceptionByOption: { "3/8": { code: "F002", label: "Denominator-only change" }, "4/6": { code: "F003", label: "Mismatched scaling" }, "5/8": { code: "F004", label: "Random ratio" } }, explanationCorrect: "3/4 x 2/2 = 6/8.", hints: ["Scale both numbers equally.", "Multiply by 2.", "6/8."] }),
  makeTF({ id: "KC5_Q3", kc: "KC5", difficulty: 1, prompt: "True or False: 4/6 and 2/3 are equivalent.", correct_boolean: true, explanationCorrect: "4/6 simplifies to 2/3.", hints: ["Try simplify 4/6.", "Divide by 2.", "It becomes 2/3 → True."] }),
  makeMcq({ id: "KC5_Q4", kc: "KC5", difficulty: 2, prompt: "Which is NOT equivalent to 1/2?", options: ["2/4", "3/6", "4/8", "2/3"], correct_option: "2/3", misconceptionByOption: { "2/4": { code: "F004", label: "Missed negative condition" }, "3/6": { code: "F004", label: "Missed negative condition" }, "4/8": { code: "F004", label: "Missed negative condition" } }, explanationCorrect: "2/3 is not equal to 1/2.", hints: ["Test by simplifying.", "2/4,3/6,4/8 simplify to 1/2.", "2/3 does not."] }),
  makeFill({ id: "KC5_Q5", kc: "KC5", difficulty: 2, prompt: "Are 3/9 and 1/3 equivalent? Answer yes or no: __", correct_text: "yes", explanationCorrect: "3/9 ÷ 3/3 = 1/3. They are equivalent.", hints: ["Simplify 3/9.", "Divide numerator and denominator by 3.", "3/9 = 1/3. Yes."] }),
  makeMulti({ id: "KC5_Q6", kc: "KC5", difficulty: 3, prompt: "Select all fractions equivalent to 2/3.", options: ["4/6", "6/9", "2/6", "10/15"], correct_options: ["4/6", "6/9", "10/15"], explanationCorrect: "4/6, 6/9, 10/15 all equal 2/3.", hints: ["Multiply 2/3 by 2/2, 3/3, 5/5.", "Check each option.", "2/6 simplifies to 1/3, not 2/3."] }),
  makeMcq({ id: "KC5_Q7", kc: "KC5", difficulty: 3, prompt: "Which pair of fractions is equivalent?", options: ["2/5 and 4/9", "3/4 and 6/8", "1/3 and 2/7", "5/6 and 4/5"], correct_option: "3/4 and 6/8", misconceptionByOption: { "2/5 and 4/9": { code: "F003", label: "Not same ratio" }, "1/3 and 2/7": { code: "F003", label: "Not same ratio" }, "5/6 and 4/5": { code: "F003", label: "Different values" } }, explanationCorrect: "3/4 × 2/2 = 6/8. They are equivalent.", hints: ["Cross multiply each pair.", "3×8 = 4×6 → 24 = 24.", "Only 3/4 and 6/8 match."] }),
  makeTF({ id: "KC5_Q8", kc: "KC5", difficulty: 3, prompt: "True or False: 5/8 and 10/16 are equivalent.", correct_boolean: true, explanationCorrect: "5/8 × 2/2 = 10/16. Equivalent.", hints: ["Multiply 5/8 by 2/2.", "5×2=10, 8×2=16.", "10/16 = 5/8. True."] }),

  // ─── KC6: Generating Equivalence (8) ──────────────────────────────────────
  makeFill({ id: "KC6_Q1", kc: "KC6", difficulty: 1, prompt: "Fill in equivalent fraction: 1/3 = __/6", correct_text: "2/6", explanationCorrect: "Multiply both by 2.", hints: ["3 becomes 6 by x2.", "Do same on numerator.", "2/6."] }),
  makeFill({ id: "KC6_Q2", kc: "KC6", difficulty: 1, prompt: "Fill in equivalent fraction: 2/5 = __/10", correct_text: "4/10", explanationCorrect: "5 × 2 = 10, so 2 × 2 = 4. Answer: 4/10.", hints: ["What multiplied 5 to get 10?", "Apply same to numerator.", "4/10."] }),
  makeMcq({ id: "KC6_Q3", kc: "KC6", difficulty: 2, prompt: "Which is equivalent to 2/3?", options: ["4/6", "2/6", "3/2", "4/3"], correct_option: "4/6", misconceptionByOption: { "2/6": { code: "F002", label: "Scaled one side" }, "3/2": { code: "F001", label: "Swapped" }, "4/3": { code: "F003", label: "Wrong denominator" } }, explanationCorrect: "2/3 x 2/2 = 4/6.", hints: ["Scale both top and bottom.", "Try x2.", "4/6."] }),
  makeFill({ id: "KC6_Q4", kc: "KC6", difficulty: 2, prompt: "Generate an equivalent fraction: 3/4 = 9/__", correct_text: "9/12", explanationCorrect: "3 × 3 = 9, so 4 × 3 = 12. Answer: 9/12.", hints: ["What multiplied 3 to get 9?", "Apply x3 to denominator.", "4 × 3 = 12."] }),
  makeFill({ id: "KC6_Q5", kc: "KC6", difficulty: 3, prompt: "Fill in equivalent fraction: 5/8 = __/24", correct_text: "15/24", explanationCorrect: "8 to 24 is x3, so 5 to 15 is x3.", hints: ["Find denominator scale.", "Apply same to numerator.", "15/24."] }),
  makeMulti({ id: "KC6_Q6", kc: "KC6", difficulty: 3, prompt: "Select all fractions equivalent to 3/5.", options: ["6/10", "9/15", "3/10", "12/20"], correct_options: ["6/10", "9/15", "12/20"], explanationCorrect: "All selected fractions are 3/5 scaled.", hints: ["Multiply by 2,3,4.", "Equivalent ratios stay same.", "Select 6/10, 9/15, 12/20."] }),
  makeTF({ id: "KC6_Q7", kc: "KC6", difficulty: 2, prompt: "True or False: You can make an equivalent fraction by adding the same number to numerator and denominator.", correct_boolean: false, explanationCorrect: "You must multiply (not add) both by the same number to keep equivalence.", hints: ["Try adding 2 to 1/2: (1+2)/(2+2) = 3/4.", "Is 3/4 = 1/2? No.", "Only multiplication preserves equivalence."] }),
  makeMcq({ id: "KC6_Q8", kc: "KC6", difficulty: 3, prompt: "What is the simplest form of 12/18?", options: ["2/3", "6/9", "4/6", "3/4"], correct_option: "2/3", misconceptionByOption: { "6/9": { code: "F003", label: "Not fully simplified" }, "4/6": { code: "F003", label: "Not fully simplified" }, "3/4": { code: "F001", label: "Wrong simplification" } }, explanationCorrect: "GCD of 12 and 18 is 6. 12÷6=2, 18÷6=3. Answer: 2/3.", hints: ["Find GCD of 12 and 18.", "GCD = 6.", "12/6=2, 18/6=3 → 2/3."] }),

  // ─── KC7: Compare Same Denominator (8) ────────────────────────────────────
  makeMcq({ id: "KC7_Q1", kc: "KC7", difficulty: 1, prompt: "Which is greater: 3/7 or 5/7?", options: ["3/7", "5/7", "Equal", "Cannot tell"], correct_option: "5/7", misconceptionByOption: { "3/7": { code: "F001", label: "Chose smaller numerator" }, "Equal": { code: "F003", label: "False equality" }, "Cannot tell": { code: "F004", label: "Same denominator rule unknown" } }, explanationCorrect: "Same denominator: compare numerators. 5 > 3 so 5/7 > 3/7.", hints: ["Same denominator means same size parts.", "Just compare the numerators.", "5 > 3 so 5/7 is greater."] }),
  makeMcq({ id: "KC7_Q2", kc: "KC7", difficulty: 1, prompt: "Which is smaller: 2/9 or 7/9?", options: ["2/9", "7/9", "Equal", "Need more info"], correct_option: "2/9", misconceptionByOption: { "7/9": { code: "F001", label: "Chose larger numerator as smaller" }, "Equal": { code: "F003", label: "Not equal" }, "Need more info": { code: "F004", label: "Same denominator strategy not applied" } }, explanationCorrect: "Same denominator: 2 < 7, so 2/9 < 7/9.", hints: ["Same denominator.", "Compare numerators directly.", "2 < 7, answer is 2/9."] }),
  makeFill({ id: "KC7_Q3", kc: "KC7", difficulty: 1, prompt: "Fill in with >, <, or = : 4/11 __ 9/11", correct_text: "<", explanationCorrect: "Same denominator; 4 < 9, so 4/11 < 9/11.", hints: ["Same denominator.", "Compare numerators.", "4 < 9."] }),
  makeTF({ id: "KC7_Q4", kc: "KC7", difficulty: 2, prompt: "True or False: 6/13 > 8/13.", correct_boolean: false, explanationCorrect: "Same denominator; 6 < 8, so 6/13 < 8/13. Statement is False.", hints: ["Same denominator.", "Compare 6 and 8.", "6 < 8 so 6/13 < 8/13. False."] }),
  makeMcq({ id: "KC7_Q5", kc: "KC7", difficulty: 2, prompt: "Order from least to greatest: 5/8, 1/8, 7/8, 3/8.", options: ["1/8, 3/8, 5/8, 7/8", "7/8, 5/8, 3/8, 1/8", "1/8, 5/8, 3/8, 7/8", "3/8, 1/8, 5/8, 7/8"], correct_option: "1/8, 3/8, 5/8, 7/8", misconceptionByOption: { "7/8, 5/8, 3/8, 1/8": { code: "F001", label: "Reversed" }, "1/8, 5/8, 3/8, 7/8": { code: "F003", label: "Wrong middle order" }, "3/8, 1/8, 5/8, 7/8": { code: "F003", label: "Wrong start" } }, explanationCorrect: "Same denominator; order by numerator: 1, 3, 5, 7.", hints: ["All have denominator 8.", "Just sort numerators: 1,3,5,7.", "1/8, 3/8, 5/8, 7/8."] }),
  makeMulti({ id: "KC7_Q6", kc: "KC7", difficulty: 3, prompt: "Select all fractions greater than 4/10.", options: ["6/10", "2/10", "9/10", "3/10"], correct_options: ["6/10", "9/10"], explanationCorrect: "6/10 and 9/10 have numerators greater than 4.", hints: ["Same denominator (10).", "Compare each numerator to 4.", "Only numerators > 4 qualify."] }),
  makeFill({ id: "KC7_Q7", kc: "KC7", difficulty: 2, prompt: "Fill in with >, <, or = : 7/15 __ 7/15", correct_text: "=", explanationCorrect: "Identical fractions are equal.", hints: ["Same numerator and denominator.", "Any fraction equals itself.", "Answer: =."] }),
  makeMcq({ id: "KC7_Q8", kc: "KC7", difficulty: 3, prompt: "Which set is ordered correctly from greatest to least (same denominator)?", options: ["8/12, 5/12, 3/12, 1/12", "1/12, 3/12, 5/12, 8/12", "5/12, 8/12, 3/12, 1/12", "3/12, 1/12, 5/12, 8/12"], correct_option: "8/12, 5/12, 3/12, 1/12", misconceptionByOption: { "1/12, 3/12, 5/12, 8/12": { code: "F001", label: "Least to greatest instead" }, "5/12, 8/12, 3/12, 1/12": { code: "F003", label: "Partially sorted" }, "3/12, 1/12, 5/12, 8/12": { code: "F003", label: "Wrong order" } }, explanationCorrect: "Greatest to least: 8/12, 5/12, 3/12, 1/12.", hints: ["Same denominator.", "Order numerators greatest to least.", "8 > 5 > 3 > 1."] }),
];

const allQuestions = [...questions, ...extraQuestions];

module.exports = allQuestions;
module.exports.lessons = lessons;
