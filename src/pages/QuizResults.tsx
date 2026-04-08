import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import { calculateQuizScores, quizCategories } from '@/lib/quizData';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ArrowRight } from 'lucide-react';

const getLevel = (score: number) => {
  if (score >= 70) return { label: 'Strong', color: 'text-green-500', bg: 'bg-green-500/10' };
  if (score >= 40) return { label: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
  return { label: 'Needs Attention', color: 'text-red-500', bg: 'bg-red-500/10' };
};

const QuizResults = () => {
  const { gameResponses, scores, setScores } = useBandwidth();
  const navigate = useNavigate();

  const quizScores = useMemo(() => {
    const answers = gameResponses.quizAnswers || {};
    return calculateQuizScores(answers);
  }, [gameResponses]);

  // Map quiz scores to game scores on first render
  useMemo(() => {
    setScores({
      planning: quizScores.timeManagement || 0,
      impulseControl: quizScores.selfControl || 0,
      stressRegulation: quizScores.stress || 0,
      socialSupport: quizScores.socialConnectedness || 0,
      financialStress: 100 - (quizScores.financialThreat || 0), // invert: higher financialThreat = more stress
    });
  }, [quizScores]);

  const chartData = [
    { subject: 'Stress Mgmt', value: quizScores.stress || 0, fullMark: 100 },
    { subject: 'Self-Control', value: quizScores.selfControl || 0, fullMark: 100 },
    { subject: 'Time Mgmt', value: quizScores.timeManagement || 0, fullMark: 100 },
    { subject: 'Financial', value: quizScores.financialThreat || 0, fullMark: 100 },
    { subject: 'Social', value: quizScores.socialConnectedness || 0, fullMark: 100 },
  ];

  const dimensions = quizCategories.map(cat => ({
    ...cat,
    score: quizScores[cat.key] || 0,
  }));

  const lowest = dimensions.reduce((a, b) => a.score < b.score ? a : b);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-8 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <span className="text-4xl mb-3 block">📊</span>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">
              Your Cognitive Bandwidth Profile
            </h1>
            <p className="text-muted-foreground text-sm">
              Based on validated research scales
            </p>
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 mb-6"
          >
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={chartData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Score cards */}
          <div className="space-y-3 mb-8">
            {dimensions.map((dim, i) => {
              const level = getLevel(dim.score);
              return (
                <motion.div
                  key={dim.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{dim.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{dim.label}</p>
                      <p className="text-[10px] text-muted-foreground">{dim.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-foreground">{dim.score}</p>
                      <span className={`text-[10px] font-bold ${level.color}`}>{level.label}</span>
                    </div>
                  </div>
                  {/* Score bar */}
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${dim.score}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Biggest area callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card-elevated p-6 text-center mb-6"
          >
            <p className="text-sm text-muted-foreground mb-1">Your biggest area for growth:</p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">{lowest.emoji}</span>
              <p className="text-lg font-extrabold text-foreground">{lowest.label}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Now let's see how this plays out in real decisions...
            </p>
            <button
              onClick={() => navigate('/game/1')}
              className="gradient-primary text-primary-foreground px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 inline-flex items-center gap-2"
            >
              Start Decision Challenges
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default QuizResults;
