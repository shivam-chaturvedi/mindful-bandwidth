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

// ─── New Solutions Content Bank ─────────────────────────────────────────────
// Based on the Bandwidth Chatbot Stress-Solutions Content Bank
// Domain mapping: stress → PSS, selfControl → BSCS, timeManagement → TMQ,
// financialThreat → Financial Threat Scale, socialConnectedness → SCS
export const solutionsByDomain: Record<string, Solution[]> = {

  // ── Stress ────────────────────────────────────────────────────────────────
  stress: [
    {
      id: 'box-breathing',
      title: 'Box Breathing Reset',
      description: 'Interrupt a stress spike in the moment by manually slowing your breathing rate, which downshifts the body\'s fight-or-flight activation.',
      source: 'Jerath, Edry, Barnes & Jerath, 2006 — Medical Hypotheses, 67, 566–571',
      steps: [
        'Breathe in slowly through your nose for 4 counts.',
        'Hold for 4 counts.',
        'Breathe out slowly for 4 counts.',
        'Hold empty for 4 counts. Repeat for 6–8 cycles.',
      ],
      duration: '2 min, use anytime',
      category: 'stress',
    },
    {
      id: 'worry-window',
      title: 'Worry Window',
      description: 'Contain open-ended worry to one scheduled slot instead of letting it intrude all day, which reduces overall worry frequency over time.',
      source: 'Borkovec, Wilkinson, Folensbee & Lerman, 1983 — Behaviour Research and Therapy, 21(3), 247–251',
      steps: [
        'Pick one fixed 10-minute slot each day as your "worry window."',
        'When a worry pops up outside that window, jot a 3-word note and set it aside.',
        'During the window, go through your notes; think them through fully or plan one action.',
        'When the window ends, close it — literally close the notebook or app.',
      ],
      duration: '10 min daily, 3 days to build',
      category: 'stress',
    },
    {
      id: 'progressive-muscle',
      title: 'Progressive Muscle Release',
      description: 'Physically release the muscle tension chronic stress builds up — one of the most consistently validated body-based stress techniques.',
      source: 'Jacobson, 1938 — Progressive Relaxation, University of Chicago Press',
      steps: [
        'Starting at your feet, tense the muscle group hard for 5 seconds.',
        'Release suddenly and notice the contrast for 10 seconds.',
        'Move upward — calves, thighs, stomach, hands, arms, shoulders, face.',
        'Finish with 3 slow breaths, noticing your whole body.',
      ],
      duration: '8 min, before sleep or break',
      category: 'stress',
    },
  ],

  // ── Self-Control ──────────────────────────────────────────────────────────
  selfControl: [
    {
      id: 'if-then-plan',
      title: 'If-Then Plan',
      description: 'Pre-decide your response to a known trigger before it happens, so you\'re not relying on in-the-moment willpower.',
      source: 'Gollwitzer, 1999 — American Psychologist, 54(7), 493–503',
      steps: [
        'Name one specific situation where your self-control usually breaks.',
        'Write it as: "If [situation], then I will [specific action]."',
        'Keep the sentence somewhere you\'ll see it right before the situation happens.',
        'Review and adjust weekly if it isn\'t working.',
      ],
      duration: '5 min setup',
      category: 'selfControl',
    },
    {
      id: 'temptation-bundling',
      title: 'Temptation Bundling',
      description: 'Pair something you tend to avoid with something you genuinely enjoy, so you only get the enjoyable thing while doing the harder task.',
      source: 'Milkman, Minson & Volpp, 2014 — Management Science, 60(2), 283–299',
      steps: [
        'Pick one task you keep putting off.',
        'Pick one enjoyable thing you only allow yourself during that task (a show, a playlist, a snack).',
        'Lock the pairing — the enjoyable thing is off-limits any other time.',
        'Track how many times you actually stick to the pairing this week.',
      ],
      duration: 'Ongoing',
      category: 'selfControl',
    },
    {
      id: 'precommitment-line',
      title: 'Precommitment Line',
      description: 'Remove the decision entirely at the moment of temptation by locking in a choice ahead of time.',
      source: 'Ariely & Wertenbroch, 2002 — Psychological Science, 13(3), 219–224',
      steps: [
        'Identify a repeated decision where you usually give in (spending, snoozing, scrolling).',
        'Add a real friction point before it: hand your card to a friend, log off, set an app limit.',
        'Tell one other person your precommitment out loud — accountability sharpens it.',
        'Review after a week: did the friction actually change what you did?',
      ],
      duration: 'One-time setup',
      category: 'selfControl',
    },
  ],

  // ── Time Management ───────────────────────────────────────────────────────
  timeManagement: [
    {
      id: 'urgent-important-sort',
      title: 'Urgent/Important Sort',
      description: 'Most time stress comes from urgent-but-unimportant tasks crowding out what actually matters; sorting tasks into four boxes makes that visible.',
      source: 'Covey, 1989 — The 7 Habits of Highly Effective People (Eisenhower Matrix)',
      steps: [
        'List everything on your plate today.',
        'Sort each into: Urgent+Important, Important-not-urgent, Urgent-not-important, Neither.',
        'Do the Urgent+Important box first.',
        'Schedule real time for the Important-not-urgent box — that\'s usually what gets neglected.',
      ],
      duration: '10 min, daily',
      category: 'timeManagement',
    },
    {
      id: 'single-task-block',
      title: 'Single-Task Block',
      description: 'Switching between tasks carries a real cognitive cost you don\'t notice losing; single-tasking in blocks avoids that tax.',
      source: 'Rubinstein, Meyer & Evans, 2001 — Journal of Experimental Psychology: HPP, 27(4), 763–797',
      steps: [
        'Pick one task and set a 25-minute timer.',
        'Put your phone out of reach / notifications off for that block.',
        'Work only on that task until the timer ends — write other thoughts down for later, don\'t switch.',
        'Take a 5-minute break, then decide: another block, or move on.',
      ],
      duration: '25 min blocks',
      category: 'timeManagement',
    },
    {
      id: 'weekly-closeout',
      title: 'Weekly Close-Out',
      description: 'Unfinished tasks stay mentally "open" and intrusive; a fixed weekly review closes loops on paper instead of in your head.',
      source: 'Zeigarnik, 1927; Allen, 2001 — Getting Things Done',
      steps: [
        'Once a week, list every open task or commitment you\'re aware of.',
        'For each: decide the next single action, whose task it is, or drop it.',
        'Put next actions on your calendar or list for the coming week.',
        'Close the review — trust the list, not your memory, for the rest of the week.',
      ],
      duration: '20 min, once a week',
      category: 'timeManagement',
    },
  ],

  // ── Financial ─────────────────────────────────────────────────────────────
  financialThreat: [
    {
      id: 'financial-buffer-plan',
      title: 'Financial Buffer Plan',
      description: 'Reduce the cognitive tax of financial stress by creating a small safety net through tracked spending.',
      source: 'Mullainathan & Shafir, 2013 — Scarcity: Why Having Too Little Means So Much',
      steps: [
        'Track every expense for 5 days (write it down, no judgement).',
        'Identify 2 expenses you can reduce or eliminate this week.',
        'Set a goal: save even a small amount (₹100 / $5) per week.',
        'Automate if possible — remove the decision from your daily life.',
      ],
      duration: '5 days to start',
      category: 'financialThreat',
    },
    {
      id: 'financial-stress-reframing',
      title: 'Financial Stress Reframing',
      description: 'Separate financial worry from financial action to free up mental bandwidth.',
      source: 'CSI-Y Toolkit, Chapter 1: Recognizing Scarcity & Stress',
      steps: [
        'Write down your top 3 financial worries.',
        'For each, ask: "Can I take any action on this today?"',
        'If yes → write the smallest step and do it. If no → acknowledge and move on.',
        'Schedule 15 min weekly as "financial planning time" — worry outside that is unproductive.',
      ],
      duration: '15 min weekly',
      category: 'financialThreat',
    },
    {
      id: 'automatic-micro-save',
      title: 'Automatic Micro-Save',
      description: 'Saving decisions fail most often because they require an active choice every time; automating a small, fixed transfer removes the decision entirely.',
      source: 'Thaler & Benartzi, 2004 — Journal of Political Economy, 112(S1), S164–S187',
      steps: [
        'Pick the smallest amount that wouldn\'t hurt to lose from each payday (even ₹50/$1).',
        'Set up an automatic transfer for that amount right after payday, into a separate account.',
        'Don\'t touch that account for anything except a genuine emergency.',
        'Increase the amount only when it\'s felt easy for 3 straight paydays.',
      ],
      duration: '5 min setup, automatic after',
      category: 'financialThreat',
    },
  ],

  // ── Social Connectedness ──────────────────────────────────────────────────
  socialConnectedness: [
    {
      id: 'reach-out-ladder',
      title: 'Reach-Out Ladder',
      description: 'Isolation compounds because reaching out feels like a big effort; starting at the lowest-effort rung makes it easy to actually do.',
      source: 'Holt-Lunstad, Smith & Layton, 2010 — PLOS Medicine, 7(7), e1000316',
      steps: [
        'Pick one person you haven\'t properly spoken to in a while.',
        'Start at the lowest rung: send a short text ("thinking of you," a meme, a question).',
        'If that goes well, next time try a rung up: a call, or "want to grab food this week?"',
        'Do one rung, with one person, most days — it compounds.',
      ],
      duration: '5 min, daily',
      category: 'socialConnectedness',
    },
    {
      id: 'shared-activity-anchor',
      title: 'Shared Activity Anchor',
      description: 'Recurring shared activity builds connection more reliably than one-off hangouts, because it removes the need to re-decide and re-plan every time.',
      source: 'Putnam, 2000 — Bowling Alone: The Collapse and Revival of American Community',
      steps: [
        'Pick one low-stakes recurring activity (meal, walk, game, prayer, gym).',
        'Invite the same 1–2 people to join it on a fixed day/time.',
        'Keep the standing plan even if only one person shows up some weeks.',
        'Protect this time the way you\'d protect a work commitment.',
      ],
      duration: 'Ongoing, weekly',
      category: 'socialConnectedness',
    },
    {
      id: 'weak-tie-checkin',
      title: 'Weak-Tie Check-In',
      description: 'Brief, low-effort interactions with people outside your close circle measurably boost daily mood and belonging — deep friendship isn\'t required to feel less isolated.',
      source: 'Sandstrom & Dunn, 2014 — Personality and Social Psychology Bulletin, 40(7), 910–922',
      steps: [
        'Pick one small interaction you usually rush through (a greeting, checkout, hallway pass).',
        'Add 10 seconds: ask a real question, use their name, actually make eye contact.',
        'Do this with at least 2 different people today.',
        'Notice how it felt afterward — this is the data that keeps you doing it.',
      ],
      duration: '2 min, a few times a day',
      category: 'socialConnectedness',
    },
  ],
};

// ─── Weekly Systems Solution ───────────────────────────────────────────────
// Shown when the pattern is chronic / repeating across sessions
export const weeklyResetSolution: Solution = {
  id: 'weekly-reset',
  title: 'The Weekly Reset',
  description: 'One-off techniques help on a single hard day, but chronic patterns respond to a repeating system. Two things reliably predict follow-through: planning around your actual obstacle in advance, and having visible proof of small progress.',
  source: 'Oettingen & Gollwitzer (WOOP/MCII); Lally et al., 2010, Eur. J. Social Psych.; Amabile & Kramer, 2011, The Progress Principle',
  steps: [
    'Every Sunday (10 min): pick 1–3 tasks you\'ve been avoiding. For each, do a WOOP — Wish, Outcome, Obstacle, Plan.',
    'Shrink each task to a 2-minute starter action — not "finish the essay," just "open the doc and write one sentence."',
    'Every day, log one tap: did you do the starter action today? Yes/No — nothing else to fill in.',
    'If you miss a day, don\'t restart the count. One missed day barely affects habit formation.',
    'End of week: glance back at the log to notice what was different about the days you skipped.',
  ],
  duration: '10 min every Sunday + 10-second daily tap',
  category: 'timeManagement',
};

function selectSolutionsForDomain(domain: string, count: number, shownIds: string[]): Solution[] {
  const all = solutionsByDomain[domain] || [];
  if (all.length === 0) return [];
  
  // Filter out solutions that have already been shown
  let available = all.filter(s => !shownIds.includes(s.id));
  
  // Recycle and reset if we don't have enough available
  if (available.length < count) {
    available = [...all];
  }
  
  // Shuffle/randomize available solutions
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getRecommendedSolutions(
  scores: Record<string, number>,
  onboardingSelections: string[] = [],
  shownIds: string[] = []
): Solution[] {
  const sorted = Object.entries(scores).sort(([, a], [, b]) => a - b);

  const solutions: Solution[] = [];

  // 2 from weakest domain, 1 from second weakest
  const weakest = sorted[0]?.[0];
  const secondWeakest = sorted[1]?.[0];

  if (weakest) {
    solutions.push(...selectSolutionsForDomain(weakest, 2, shownIds));
  }
  if (secondWeakest) {
    solutions.push(...selectSolutionsForDomain(secondWeakest, 1, shownIds));
  }

  // If the user flagged "Stop procrastinating" during onboarding, substitute a planning/timeManagement
  // solution with the Weekly Reset chronic-pattern system.
  if (onboardingSelections && onboardingSelections.includes('procrastinate')) {
    const tmIdx = solutions.findIndex(s => s.category === 'timeManagement');
    if (tmIdx !== -1) {
      solutions[tmIdx] = weeklyResetSolution;
    } else if (solutions.length > 0) {
      solutions[solutions.length - 1] = weeklyResetSolution;
    } else {
      solutions.push(weeklyResetSolution);
    }
  }

  return solutions;
}

// Looks up any solution (including Weekly Reset) by its string ID
export function getSolutionById(id: string): Solution | undefined {
  if (id === 'weekly-reset') return weeklyResetSolution;
  return Object.values(solutionsByDomain)
    .flat()
    .find(s => s.id === id);
}

// QuizCategory re-export for convenience (keeps consumers unchanged)
export type { QuizCategory };
