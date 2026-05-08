import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import {
  MessageSquare, Wind, ClipboardList, Target, Dumbbell, Users, BarChart3, TrendingUp, ArrowRight,
} from 'lucide-react';
import { calculateQuizScores } from '@/lib/quizData';

const features = [
  { to: '/ai-coach', icon: MessageSquare, title: 'AI Coach', desc: 'Talk through your patterns' },
  { to: '/results', icon: BarChart3, title: 'Your Insights', desc: 'Bandwidth profile & charts' },
  { to: '/interventions', icon: Target, title: 'Action Plan', desc: 'CSI-Y recommended steps' },
  { to: '/game/1', icon: Dumbbell, title: 'Practice Exercises', desc: 'Decision challenges' },
  { to: '/checkin', icon: ClipboardList, title: 'Daily Check-in', desc: 'Track your bandwidth' },
  { to: '/breathing', icon: Wind, title: 'Breathing Tool', desc: '60-second reset' },
];

const Home = () => {
  const navigate = useNavigate();
  const { gameResponses, scores } = useBandwidth();
  const quizScores = calculateQuizScores(gameResponses.quizAnswers || {});
  const hasQuiz = Object.keys(gameResponses.quizAnswers || {}).length > 0;

  const overall = hasQuiz
    ? Math.round(
        (quizScores.stress + quizScores.selfControl + quizScores.timeManagement +
          quizScores.financialThreat + quizScores.socialConnectedness) / 5
      )
    : null;

  return (
    <PageTransition>
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-1">Dashboard</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Your space to understand and rebuild cognitive bandwidth.
          </p>
        </motion.div>

        {/* Score summary */}
        {hasQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card-elevated p-6 mb-6"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Overall bandwidth
                </p>
                <p className="text-3xl font-bold text-foreground">{overall}<span className="text-base text-muted-foreground font-medium">/100</span></p>
              </div>
              <button
                onClick={() => navigate('/results')}
                className="px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:border-primary/40 hover:bg-muted transition-colors flex items-center gap-1.5"
              >
                View full report <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
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
                <p className="text-sm font-semibold text-foreground mb-1">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
};

export default Home;