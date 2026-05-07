import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import { ArrowRight, Target, ListChecks, CalendarDays, Check } from 'lucide-react';

const interventions: Record<string, { title: string; desc: string; steps: string[]; icon: any; color: string }> = {
  planning: {
    title: 'Goal Breakdown',
    desc: 'Break overwhelming tasks into 3 manageable steps',
    steps: ['Pick 1 task that feels overwhelming', 'Break it into exactly 3 small steps', 'Schedule each step in your calendar'],
    icon: ListChecks,
    color: 'bg-sky',
  },
  impulseControl: {
    title: 'Decision Journal',
    desc: 'Pause before big choices and write a quick pros & cons',
    steps: ['When facing a decision, pause for 30 seconds', 'Write 2 pros and 2 cons', 'Ask: "Will future me thank me?"'],
    icon: Target,
    color: 'bg-sunshine',
  },
  stressRegulation: {
    title: 'Stress Mapping',
    desc: 'Identify your top 3 stressors and one action for each',
    steps: ['List your top 3 sources of stress right now', 'For each, write one tiny action you can take', 'Do the easiest one today'],
    icon: CalendarDays,
    color: 'bg-mint',
  },
  socialSupport: {
    title: 'Support Network Map',
    desc: 'Identify people who can help and reach out to one',
    steps: ['List 3 people you trust', 'Identify one thing each could help with', 'Message one of them today'],
    icon: Target,
    color: 'bg-blush',
  },
  financialStress: {
    title: 'Financial Buffer Plan',
    desc: 'Create a small emergency buffer to reduce worry',
    steps: ['Track spending for 3 days', 'Find one expense to reduce this week', 'Set aside even a small amount'],
    icon: CalendarDays,
    color: 'bg-lavender/40',
  },
};

const Interventions = () => {
  const { scores, commitmentIntervention, setCommitmentIntervention } = useBandwidth();
  const navigate = useNavigate();
  const [committed, setCommitted] = useState(false);

  // Find lowest area
  const scoreEntries = [
    { key: 'planning', score: scores.planning },
    { key: 'impulseControl', score: scores.impulseControl },
    { key: 'stressRegulation', score: scores.stressRegulation },
    { key: 'socialSupport', score: scores.socialSupport },
    { key: 'financialStress', score: 100 - scores.financialStress },
  ];
  const lowest = scoreEntries.reduce((a, b) => a.score < b.score ? a : b);
  const intervention = interventions[lowest.key];
  const Icon = intervention.icon;

  const handleCommit = () => {
    setCommitmentIntervention(lowest.key);
    setCommitted(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center px-4 py-8 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider rounded-sm mb-3">
              <Target className="w-3 h-3" /> Action Plan
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Your Recommended Action
            </h1>
            <p className="text-muted-foreground text-sm">
              Based on your results, focus on one thing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card-elevated p-6 mb-6"
          >
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">{intervention.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{intervention.desc}</p>

            <div className="space-y-3">
              {intervention.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[11px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground">{step}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {!committed ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6 text-center"
            >
              <p className="text-sm font-medium text-foreground mb-4">
                "I will try this for the next 5 days"
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleCommit}
                  className="gradient-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                >
                  Yes, I'm in
                </button>
                <button
                  onClick={() => navigate('/community')}
                  className="px-5 py-2.5 rounded-md border border-border bg-card text-foreground font-medium text-sm hover:border-primary/30 transition-all"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card-elevated p-6 text-center"
            >
              <div className="w-12 h-12 rounded-md bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">You're committed</h3>
              <p className="text-sm text-muted-foreground mb-4">We'll check in with you daily.</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => navigate('/checkin')}
                  className="gradient-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm shadow-sm transition-all"
                >
                  Start Day 1
                </button>
                <button
                  onClick={() => navigate('/community')}
                  className="px-5 py-2.5 rounded-md border border-border bg-card text-foreground font-medium text-sm transition-all"
                >
                  Join Community
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Interventions;
