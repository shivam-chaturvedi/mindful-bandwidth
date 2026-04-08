import { QuizCategory } from './quizData';

export interface Solution {
  id: string;
  title: string;
  description: string;
  source: string;
  steps: string[];
  duration: string;
  category: string;
}

// CSI-Y Toolkit based solutions mapped to each domain
export const solutionsByDomain: Record<string, Solution[]> = {
  stress: [
    {
      id: 'stress-mapping',
      title: 'Stress Mapping Exercise',
      description: 'Identify and categorize your stressors to understand what drains your bandwidth most.',
      source: 'CSI-Y Toolkit, Chapter 1: Recognizing Scarcity & Stress',
      steps: [
        'List your top 5 sources of stress right now',
        'Categorize each as: Financial, Academic, Social, Time, or Health',
        'Rate each from 1-10 on how much mental space it takes',
        'Pick the one you can influence most — that\'s your starting point',
      ],
      duration: '15 min',
      category: 'stress',
    },
    {
      id: 'coping-toolbox',
      title: 'Coping Toolbox',
      description: 'Build a personal toolkit of go-to strategies for when stress spikes.',
      source: 'CSI-Y Toolkit, Chapter 4: Building Resilience',
      steps: [
        'Write 3 things that help you calm down (breathing, walking, music, etc.)',
        'Write 2 people you can reach out to when overwhelmed',
        'Write 1 place that makes you feel safe or calm',
        'Keep this list on your phone — use it when stress hits',
      ],
      duration: '10 min',
      category: 'stress',
    },
    {
      id: 'breathing-grounding',
      title: 'Breathing & Grounding Exercises',
      description: 'Use physiological tools to lower stress and regain cognitive clarity.',
      source: 'CSI-Y Toolkit, Chapter 4: Building Resilience',
      steps: [
        'Practice 4-7-8 breathing: Inhale 4s, Hold 7s, Exhale 8s',
        'Do the 5-4-3-2-1 grounding: Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste',
        'Repeat daily for 5 minutes — consistency matters more than duration',
      ],
      duration: '5 min daily',
      category: 'stress',
    },
  ],
  selfControl: [
    {
      id: 'pros-cons-chart',
      title: 'Pros & Cons Decision Chart',
      description: 'Slow down impulsive decisions by systematically weighing options.',
      source: 'CSI-Y Toolkit, Chapter 3: Decision-Making Under Pressure',
      steps: [
        'When facing a decision, draw a 2x2 grid',
        'List pros and cons for choosing Option A vs Option B',
        'Ask: "What would future-me choose?"',
        'Wait 10 minutes before finalizing — impulses fade, good decisions don\'t',
      ],
      duration: '10 min per decision',
      category: 'selfControl',
    },
    {
      id: 'delay-discounting-reflection',
      title: 'Delay Discounting Reflection',
      description: 'Train your brain to value long-term rewards over instant gratification.',
      source: 'Behavioral Economics — Kirby et al., 1999',
      steps: [
        'Write down one impulsive decision you made recently',
        'Calculate: What did the short-term choice cost long-term?',
        'Next time you face a similar choice, write both options and their 1-week impact',
        'Practice choosing the "larger later" reward 3 times this week',
      ],
      duration: '1 week practice',
      category: 'selfControl',
    },
    {
      id: 'decision-journaling',
      title: 'Decision Journaling',
      description: 'Track your decisions to identify patterns of impulsivity vs. thoughtfulness.',
      source: 'CSI-Y Toolkit, Chapter 5: Synthesis & Application',
      steps: [
        'Each evening, write down 2 decisions you made today',
        'Note: Was it rushed or thoughtful? What influenced it?',
        'After 7 days, look for patterns — when are you most impulsive?',
        'Create a rule for those moments (e.g., "Before buying, wait 24 hours")',
      ],
      duration: '5 min daily for 1 week',
      category: 'selfControl',
    },
  ],
  timeManagement: [
    {
      id: 'goal-breakdown',
      title: 'Goal Breakdown Exercise',
      description: 'Transform overwhelming goals into manageable micro-tasks.',
      source: 'CSI-Y Toolkit, Chapter 2: Time Management Skills',
      steps: [
        'Pick one goal that feels too big or vague',
        'Break it into exactly 3 concrete sub-tasks',
        'For each sub-task, define: What, When, and How Long',
        'Schedule the first sub-task within the next 24 hours',
      ],
      duration: '15 min',
      category: 'timeManagement',
    },
    {
      id: 'time-audit',
      title: 'Time Audit',
      description: 'Understand where your time actually goes vs. where you think it goes.',
      source: 'CSI-Y Toolkit, Chapter 2: Time Management Skills',
      steps: [
        'For 3 days, log what you do every hour (use phone timer)',
        'Categorize: Productive, Necessary, Leisure, Wasted',
        'Calculate: How many "wasted" hours can you reclaim?',
        'Move 1 wasted hour to your most important task',
      ],
      duration: '3 days',
      category: 'timeManagement',
    },
    {
      id: 'weekly-roadmap',
      title: 'Weekly Planning Roadmap',
      description: 'Start each week with a clear plan to prevent tunneling on urgent tasks.',
      source: 'CSI-Y Toolkit, Chapter 2: Time Management Skills',
      steps: [
        'Every Sunday, list your top 5 priorities for the week',
        'Assign each to a specific day',
        'Block 2 hours of "deep work" each day — no phone, no interruptions',
        'Review Friday: What got done? What got pushed? Why?',
      ],
      duration: '20 min weekly',
      category: 'timeManagement',
    },
  ],
  financialThreat: [
    {
      id: 'financial-buffer',
      title: 'Financial Buffer Plan',
      description: 'Reduce the cognitive tax of financial stress by creating a small safety net.',
      source: 'Mullainathan & Shafir, 2013 — Scarcity: Why Having Too Little Means So Much',
      steps: [
        'Track every expense for 5 days (write it down, no judgement)',
        'Identify 2 expenses you can reduce or eliminate this week',
        'Set a goal: Save even a small amount (₹100 / $5) per week',
        'Automate if possible — remove the decision from your daily life',
      ],
      duration: '5 days to start',
      category: 'financialThreat',
    },
    {
      id: 'financial-stress-reframe',
      title: 'Financial Stress Reframing',
      description: 'Separate financial worry from financial action to free up mental bandwidth.',
      source: 'CSI-Y Toolkit, Chapter 1: Recognizing Scarcity & Stress',
      steps: [
        'Write down your top 3 financial worries',
        'For each, ask: "Can I take any action on this today?"',
        'If yes → write the smallest step and do it. If no → acknowledge and move on',
        'Schedule 15 min weekly as "financial planning time" — worry outside that is unproductive',
      ],
      duration: '15 min weekly',
      category: 'financialThreat',
    },
  ],
  socialConnectedness: [
    {
      id: 'support-network-map',
      title: 'Support Network Map',
      description: 'Visualize your social resources and identify gaps in your support system.',
      source: 'CSI-Y Toolkit, Chapter 4: Building Resilience',
      steps: [
        'Draw 3 circles: Inner (closest 2-3 people), Middle (friends), Outer (acquaintances)',
        'For each person, note: What can they help with? (emotional, practical, academic)',
        'Identify one gap — who\'s missing? (mentor, study partner, emotional support)',
        'Reach out to one person this week with a specific ask',
      ],
      duration: '20 min',
      category: 'socialConnectedness',
    },
    {
      id: 'peer-outreach-challenge',
      title: 'Peer Outreach Challenge',
      description: 'Strengthen connections by taking small, deliberate social actions.',
      source: 'CSI-Y Toolkit, Chapter 4: Building Resilience',
      steps: [
        'Day 1: Message someone you haven\'t talked to in a while',
        'Day 3: Ask someone how they\'re really doing (not small talk)',
        'Day 5: Offer help to someone — even something small',
        'Day 7: Reflect — how did these interactions affect your mood and focus?',
      ],
      duration: '1 week',
      category: 'socialConnectedness',
    },
    {
      id: 'boundary-setting',
      title: 'Boundary Setting Practice',
      description: 'Learn to say no strategically to protect your cognitive bandwidth.',
      source: 'CSI-Y Toolkit, Chapter 4: Building Resilience',
      steps: [
        'Identify 2 recurring commitments that drain you more than they help',
        'Practice a boundary script: "I\'d like to help, but I can\'t right now"',
        'Say no to one non-essential request this week',
        'Notice: Does saying no free up mental space? Track how you feel',
      ],
      duration: '1 week',
      category: 'socialConnectedness',
    },
  ],
};

// Get top solutions for a user based on their scores
export function getRecommendedSolutions(scores: Record<string, number>): Solution[] {
  // Sort domains by score (lowest first = most need)
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => a - b);

  const solutions: Solution[] = [];
  
  // Get top 2 solutions from the weakest domain, 1 from second weakest
  const weakest = sorted[0]?.[0];
  const secondWeakest = sorted[1]?.[0];

  if (weakest && solutionsByDomain[weakest]) {
    solutions.push(...solutionsByDomain[weakest].slice(0, 2));
  }
  if (secondWeakest && solutionsByDomain[secondWeakest]) {
    solutions.push(solutionsByDomain[secondWeakest][0]);
  }

  return solutions;
}
