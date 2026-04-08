export interface QuizQuestion {
  id: string;
  text: string;
  category: 'stress' | 'selfControl' | 'timeManagement' | 'financialThreat' | 'socialConnectedness';
  categoryLabel: string;
  reverse: boolean;
  minLabel: string;
  maxLabel: string;
  scale: number; // max value on the scale (e.g., 4 for 0-4, 5 for 1-5)
  scaleStart: number; // min value (0 or 1)
  emoji: string;
}

export interface QuizCategory {
  key: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
  maxRaw: number;
  questionCount: number;
}

export const quizCategories: QuizCategory[] = [
  {
    key: 'stress',
    label: 'Stress Level',
    emoji: '😰',
    color: 'hsl(0 84% 60%)',
    description: 'Perceived Stress Scale (PSS) — measures how stressed you feel',
    maxRaw: 40,
    questionCount: 10,
  },
  {
    key: 'selfControl',
    label: 'Self-Control',
    emoji: '🎯',
    color: 'hsl(262 83% 58%)',
    description: 'Brief Self-Control Scale — measures impulse control & discipline',
    maxRaw: 52, // 13 items, 1-5 scale, normalized
    questionCount: 13,
  },
  {
    key: 'timeManagement',
    label: 'Time Management',
    emoji: '⏰',
    color: 'hsl(217 91% 60%)',
    description: 'Time Management Questionnaire — measures planning & organization',
    maxRaw: 80,
    questionCount: 20,
  },
  {
    key: 'financialThreat',
    label: 'Financial Pressure',
    emoji: '💰',
    color: 'hsl(38 92% 50%)',
    description: 'Financial Threat Scale — measures money-related stress',
    maxRaw: 30, // 5 items, 1-6 scale (mapped)
    questionCount: 5,
  },
  {
    key: 'socialConnectedness',
    label: 'Social Connection',
    emoji: '🤝',
    color: 'hsl(142 71% 45%)',
    description: 'Social Connectedness Scale — measures sense of belonging',
    maxRaw: 40, // 8 items, 1-6 scale (mapped)
    questionCount: 8,
  },
];

// PSS - 10 items, 0-4 scale (never to very often). Reverse: 4,5,7,8.
// Higher score = MORE stress
const pssQuestions: Omit<QuizQuestion, 'id'>[] = [
  { text: "In the last month, how often have you been upset because of something that happened unexpectedly?", category: 'stress', categoryLabel: 'Stress', reverse: false, minLabel: 'Never', maxLabel: 'Very often', scale: 4, scaleStart: 0, emoji: '😟' },
  { text: "In the last month, how often have you felt unable to control the important things in your life?", category: 'stress', categoryLabel: 'Stress', reverse: false, minLabel: 'Never', maxLabel: 'Very often', scale: 4, scaleStart: 0, emoji: '🌀' },
  { text: "In the last month, how often have you felt nervous and stressed?", category: 'stress', categoryLabel: 'Stress', reverse: false, minLabel: 'Never', maxLabel: 'Very often', scale: 4, scaleStart: 0, emoji: '😬' },
  { text: "In the last month, how often have you felt confident about your ability to handle your personal problems?", category: 'stress', categoryLabel: 'Stress', reverse: true, minLabel: 'Never', maxLabel: 'Very often', scale: 4, scaleStart: 0, emoji: '💪' },
  { text: "In the last month, how often have you felt that things were going your way?", category: 'stress', categoryLabel: 'Stress', reverse: true, minLabel: 'Never', maxLabel: 'Very often', scale: 4, scaleStart: 0, emoji: '🌟' },
  { text: "In the last month, how often have you found that you could not cope with all the things you had to do?", category: 'stress', categoryLabel: 'Stress', reverse: false, minLabel: 'Never', maxLabel: 'Very often', scale: 4, scaleStart: 0, emoji: '😩' },
  { text: "In the last month, how often have you been able to control irritations in your life?", category: 'stress', categoryLabel: 'Stress', reverse: true, minLabel: 'Never', maxLabel: 'Very often', scale: 4, scaleStart: 0, emoji: '🧘' },
  { text: "In the last month, how often have you felt that you were on top of things?", category: 'stress', categoryLabel: 'Stress', reverse: true, minLabel: 'Never', maxLabel: 'Very often', scale: 4, scaleStart: 0, emoji: '🏔️' },
  { text: "In the last month, how often have you been angered because of things outside your control?", category: 'stress', categoryLabel: 'Stress', reverse: false, minLabel: 'Never', maxLabel: 'Very often', scale: 4, scaleStart: 0, emoji: '😤' },
  { text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?", category: 'stress', categoryLabel: 'Stress', reverse: false, minLabel: 'Never', maxLabel: 'Very often', scale: 4, scaleStart: 0, emoji: '🏋️' },
];

// BSCS - 13 items, 1-5 scale. Items with + are positive (1,6,8,11), rest are negative (reverse).
// Higher score = MORE self-control
const bscsQuestions: Omit<QuizQuestion, 'id'>[] = [
  { text: "I am good at resisting temptation.", category: 'selfControl', categoryLabel: 'Self-Control', reverse: false, minLabel: 'Not at all like me', maxLabel: 'Very much like me', scale: 5, scaleStart: 1, emoji: '🛡️' },
  { text: "I have a hard time breaking bad habits.", category: 'selfControl', categoryLabel: 'Self-Control', reverse: true, minLabel: 'Not at all like me', maxLabel: 'Very much like me', scale: 5, scaleStart: 1, emoji: '🔄' },
  { text: "I am lazy.", category: 'selfControl', categoryLabel: 'Self-Control', reverse: true, minLabel: 'Not at all like me', maxLabel: 'Very much like me', scale: 5, scaleStart: 1, emoji: '😴' },
  { text: "I say inappropriate things.", category: 'selfControl', categoryLabel: 'Self-Control', reverse: true, minLabel: 'Not at all like me', maxLabel: 'Very much like me', scale: 5, scaleStart: 1, emoji: '🗣️' },
  { text: "I do certain things that are bad for me, if they are fun.", category: 'selfControl', categoryLabel: 'Self-Control', reverse: true, minLabel: 'Not at all like me', maxLabel: 'Very much like me', scale: 5, scaleStart: 1, emoji: '🎢' },
  { text: "I refuse things that are bad for me.", category: 'selfControl', categoryLabel: 'Self-Control', reverse: false, minLabel: 'Not at all like me', maxLabel: 'Very much like me', scale: 5, scaleStart: 1, emoji: '🚫' },
  { text: "I wish I had more self-discipline.", category: 'selfControl', categoryLabel: 'Self-Control', reverse: true, minLabel: 'Not at all like me', maxLabel: 'Very much like me', scale: 5, scaleStart: 1, emoji: '🎯' },
  { text: "People would say I have iron self-discipline.", category: 'selfControl', categoryLabel: 'Self-Control', reverse: false, minLabel: 'Not at all like me', maxLabel: 'Very much like me', scale: 5, scaleStart: 1, emoji: '⚔️' },
  { text: "Pleasure and fun sometimes keep me from getting work done.", category: 'selfControl', categoryLabel: 'Self-Control', reverse: true, minLabel: 'Not at all like me', maxLabel: 'Very much like me', scale: 5, scaleStart: 1, emoji: '🎮' },
  { text: "I have trouble concentrating.", category: 'selfControl', categoryLabel: 'Self-Control', reverse: true, minLabel: 'Not at all like me', maxLabel: 'Very much like me', scale: 5, scaleStart: 1, emoji: '🧠' },
  { text: "I am able to work effectively toward long-term goals.", category: 'selfControl', categoryLabel: 'Self-Control', reverse: false, minLabel: 'Not at all like me', maxLabel: 'Very much like me', scale: 5, scaleStart: 1, emoji: '🏆' },
  { text: "Sometimes I can't stop myself from doing something, even if I know it is wrong.", category: 'selfControl', categoryLabel: 'Self-Control', reverse: true, minLabel: 'Not at all like me', maxLabel: 'Very much like me', scale: 5, scaleStart: 1, emoji: '⚡' },
  { text: "I often act without thinking through all the alternatives.", category: 'selfControl', categoryLabel: 'Self-Control', reverse: true, minLabel: 'Not at all like me', maxLabel: 'Very much like me', scale: 5, scaleStart: 1, emoji: '💨' },
];

// Time Management - 20 items, 0-4 scale. All positive (higher = better).
const tmQuestions: Omit<QuizQuestion, 'id'>[] = [
  { text: "I read selectively, skimming until I find what is important, then highlighting it.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '📖' },
  { text: "I make a list of tasks to accomplish each day.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '📝' },
  { text: "I keep everything in its proper place.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '📂' },
  { text: "I prioritize tasks according to their importance and urgency.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '🎯' },
  { text: "I concentrate on one important task at a time, but handle trivial tasks together.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '🔍' },
  { text: "I make a list of short 5-10 minute tasks to do.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '⏱️' },
  { text: "I divide large projects into smaller, separate stages.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '🧩' },
  { text: "I review my planner each day after I complete my tasks.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '📋' },
  { text: "I do the most important tasks at my best time during the day.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '☀️' },
  { text: "I have some time during each day when I can work uninterrupted.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '🔇' },
  { text: "I do today what needs to be done. I don't procrastinate.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '✅' },
  { text: "I periodically evaluate how I use my time.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '🔄' },
  { text: "I set deadlines for myself if they are not provided for me.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '📅' },
  { text: "I do something productive whenever I am waiting.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '⏳' },
  { text: "I avoid time wasters.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '🚫' },
  { text: "I finish at least one thing every day.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '🏁' },
  { text: "I schedule time during the day for personal time alone.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '🧘' },
  { text: "I set goals for the academic year.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '🎓' },
  { text: "I set goals for myself each semester.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '📊' },
  { text: "I continually try to find little ways to use my time more efficiently.", category: 'timeManagement', categoryLabel: 'Time Mgmt', reverse: false, minLabel: 'Never', maxLabel: 'Always', scale: 4, scaleStart: 0, emoji: '⚡' },
];

// Financial Threat Scale - 5 items, 1-6 scale. Higher = more threat.
const ftsQuestions: Omit<QuizQuestion, 'id'>[] = [
  { text: "I am anxious about my financial situation.", category: 'financialThreat', categoryLabel: 'Financial', reverse: false, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree', scale: 6, scaleStart: 1, emoji: '😰' },
  { text: "My financial situation feels threatening.", category: 'financialThreat', categoryLabel: 'Financial', reverse: false, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree', scale: 6, scaleStart: 1, emoji: '⚠️' },
  { text: "I worry about money.", category: 'financialThreat', categoryLabel: 'Financial', reverse: false, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree', scale: 6, scaleStart: 1, emoji: '💸' },
  { text: "I am scared about my financial situation.", category: 'financialThreat', categoryLabel: 'Financial', reverse: false, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree', scale: 6, scaleStart: 1, emoji: '😨' },
  { text: "I feel threatened by my financial situation.", category: 'financialThreat', categoryLabel: 'Financial', reverse: false, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree', scale: 6, scaleStart: 1, emoji: '🔴' },
];

// Social Connectedness Scale-Revised - 8 items, 1-6 scale.
// Reverse items: 1,2,4,5,8. Higher after scoring = more connected.
const scsQuestions: Omit<QuizQuestion, 'id'>[] = [
  { text: "I feel disconnected from the world around me.", category: 'socialConnectedness', categoryLabel: 'Social', reverse: true, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree', scale: 6, scaleStart: 1, emoji: '🌍' },
  { text: "I don't feel related to most people.", category: 'socialConnectedness', categoryLabel: 'Social', reverse: true, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree', scale: 6, scaleStart: 1, emoji: '👤' },
  { text: "I feel close to people.", category: 'socialConnectedness', categoryLabel: 'Social', reverse: false, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree', scale: 6, scaleStart: 1, emoji: '🤗' },
  { text: "I catch myself losing a sense of connectedness with society.", category: 'socialConnectedness', categoryLabel: 'Social', reverse: true, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree', scale: 6, scaleStart: 1, emoji: '🔗' },
  { text: "I don't feel I participate with anyone or any group.", category: 'socialConnectedness', categoryLabel: 'Social', reverse: true, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree', scale: 6, scaleStart: 1, emoji: '👥' },
  { text: "I feel understood by the people I know.", category: 'socialConnectedness', categoryLabel: 'Social', reverse: false, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree', scale: 6, scaleStart: 1, emoji: '💬' },
  { text: "I see people as friendly and approachable.", category: 'socialConnectedness', categoryLabel: 'Social', reverse: false, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree', scale: 6, scaleStart: 1, emoji: '😊' },
  { text: "I feel like an outsider.", category: 'socialConnectedness', categoryLabel: 'Social', reverse: true, minLabel: 'Strongly disagree', maxLabel: 'Strongly agree', scale: 6, scaleStart: 1, emoji: '🚪' },
];

// Combine all and assign IDs
const allRaw = [
  ...pssQuestions,
  ...bscsQuestions,
  ...tmQuestions,
  ...ftsQuestions,
  ...scsQuestions,
];

export const allQuestions: QuizQuestion[] = allRaw.map((q, i) => ({
  ...q,
  id: `q${i}`,
}));

// Shuffle helper
export function shuffleQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const arr = [...questions];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Scoring: returns 0-100 for each category. Higher = "better" (less stress, more control, etc.)
export function calculateQuizScores(answers: Record<string, number>): Record<string, number> {
  const categoryAnswers: Record<string, { raw: number; max: number }> = {
    stress: { raw: 0, max: 0 },
    selfControl: { raw: 0, max: 0 },
    timeManagement: { raw: 0, max: 0 },
    financialThreat: { raw: 0, max: 0 },
    socialConnectedness: { raw: 0, max: 0 },
  };

  allQuestions.forEach((q) => {
    const val = answers[q.id];
    if (val === undefined) return;

    const range = q.scale - q.scaleStart; // e.g., 4-0=4 or 5-1=4
    const normalized = val - q.scaleStart; // shift to 0-based

    let scored: number;
    if (q.reverse) {
      scored = range - normalized; // reverse
    } else {
      scored = normalized;
    }

    categoryAnswers[q.category].raw += scored;
    categoryAnswers[q.category].max += range;
  });

  const result: Record<string, number> = {};
  for (const [key, { raw, max }] of Object.entries(categoryAnswers)) {
    if (max === 0) {
      result[key] = 0;
      continue;
    }
    let pct = Math.round((raw / max) * 100);
    // For stress and financialThreat, higher raw = worse, so invert
    if (key === 'stress' || key === 'financialThreat') {
      pct = 100 - pct;
    }
    result[key] = pct;
  }

  return result;
}

// Get scale options for a question
export function getScaleOptions(q: QuizQuestion): { value: number; label: string }[] {
  const options: { value: number; label: string }[] = [];
  const labels: Record<string, string[]> = {
    'Never-Very often': ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'],
    'Not at all like me-Very much like me': ['Not at all', 'A little', 'Somewhat', 'Mostly', 'Very much'],
    'Never-Always': ['Never', 'Seldom', 'Sometimes', 'Often', 'Always'],
    'Strongly disagree-Strongly agree': ['Strongly disagree', 'Disagree', 'Slightly disagree', 'Slightly agree', 'Agree', 'Strongly agree'],
  };

  const key = `${q.minLabel}-${q.maxLabel}`;
  const labelArr = labels[key];

  for (let i = q.scaleStart; i <= q.scale; i++) {
    const idx = i - q.scaleStart;
    options.push({
      value: i,
      label: labelArr ? labelArr[idx] || `${i}` : `${i}`,
    });
  }
  return options;
}
