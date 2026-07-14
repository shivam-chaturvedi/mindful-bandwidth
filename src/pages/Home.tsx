import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import { calculateQuizScores } from '@/lib/quizData';
import { getSolutionById, Solution } from '@/lib/solutions';
import PageTransition from '@/components/PageTransition';
import Translate from '@/components/Translate';
import {
  MessageSquare, ClipboardList, BarChart3, TrendingUp, ArrowRight,
  Sparkles, Target
} from 'lucide-react';

const CURRENT_PLAN_STORAGE_KEY = 'current_plan_id';

const features = [
  { to: '/ai-coach', icon: MessageSquare, title: 'AI Coach', desc: 'Talk through your patterns' },
  { to: '/interventions', icon: Target, title: 'Plan', desc: 'View your current action plan' },
  { to: '/results', icon: BarChart3, title: 'Your Insights', desc: 'Bandwidth profile & charts' },
  { to: '/todays-reset', icon: Sparkles, title: "Today's Reset", desc: 'Personalised resets & quick relief' },
  { to: '/checkin', icon: ClipboardList, title: 'Daily Check-in', desc: 'Track your bandwidth' },
];

const Home = () => {
  const navigate = useNavigate();
  const { gameResponses } = useBandwidth();

  const [userName, setUserName] = useState('');
  const [currentPlan, setCurrentPlan] = useState<Solution | null>(null);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_name');
      if (stored) setUserName(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      const currentPlanId = localStorage.getItem(CURRENT_PLAN_STORAGE_KEY);
      setCurrentPlan(currentPlanId ? getSolutionById(currentPlanId) || null : null);
    } catch {
      setCurrentPlan(null);
    }
  }, []);

  const quizScores = useMemo(() => {
    try {
      const storedScores = localStorage.getItem('quizScores');
      if (storedScores) {
        const parsedScores = JSON.parse(storedScores);
        if (parsedScores && typeof parsedScores === 'object') {
          return parsedScores;
        }
      }
    } catch {
      /* ignore */
    }

    let answers = gameResponses.quizAnswers || {};
    if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
      try {
        const stored = localStorage.getItem('quizAnswers');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') answers = parsed;
        }
      } catch {
        /* ignore */
      }
    }

    const computedScores = calculateQuizScores(answers && typeof answers === 'object' ? answers : {});

    try {
      if (Object.values(computedScores).some((value) => typeof value === 'number')) {
        localStorage.setItem('quizScores', JSON.stringify(computedScores));
      }
    } catch {
      /* ignore */
    }

    return computedScores;
  }, [gameResponses]);

  const hasQuiz = useMemo(() => {
    try {
      const stored = localStorage.getItem('quizAnswers');
      return !!stored || Object.keys(gameResponses.quizAnswers || {}).length > 0;
    } catch {
      return Object.keys(gameResponses.quizAnswers || {}).length > 0;
    }
  }, [gameResponses]);

  const overall = useMemo(() => {
    if (!hasQuiz) return null;
    return Math.round(
      (quizScores.stress + quizScores.selfControl + quizScores.timeManagement +
        quizScores.financialThreat + quizScores.socialConnectedness) / 5
    );
  }, [hasQuiz, quizScores]);

  return (
    <PageTransition>
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-1">
            <Translate>Dashboard</Translate>
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            <Translate>Welcome back</Translate>{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="text-sm text-muted-foreground">
            <Translate>Your space to understand and rebuild cognitive bandwidth.</Translate>
          </p>
        </motion.div>

        {/* Score summary */}
        {hasQuiz && (
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card-elevated p-6"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> <Translate>Overall bandwidth</Translate>
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {overall}<span className="text-base text-muted-foreground font-medium">/100</span>
                  </p>
                </div>
                <button
                  onClick={() => navigate('/results')}
                  className="px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:border-primary/40 hover:bg-muted transition-colors flex items-center gap-1.5"
                >
                  <Translate>View full report</Translate> <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              onClick={() => navigate('/interventions')}
              className="glass-card-elevated p-6 text-left hover:border-primary/30 transition-all"
            >
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <Target className="w-3 h-3" /> <Translate>Plan</Translate>
              </p>
              {currentPlan ? (
                <>
                  <p className="text-lg font-bold text-foreground mb-1">{currentPlan.title}</p>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{currentPlan.description}</p>
                  <p className="text-[11px] font-semibold text-primary">
                    <Translate>Open current plan</Translate>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-foreground mb-1">
                    <Translate>No plan pinned yet</Translate>
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    <Translate>Pin a plan from the AI Coach to keep your current next steps visible here.</Translate>
                  </p>
                  <p className="text-[11px] font-semibold text-primary">
                    <Translate>Go set your plan</Translate>
                  </p>
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* Quick action grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.button
                key={f.to}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                onClick={() => navigate(f.to)}
                className="group text-left p-5 rounded-md border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  <Translate>{f.title}</Translate>
                </p>
                <p className="text-xs text-muted-foreground">
                  <Translate>{f.desc}</Translate>
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
};

export default Home;
