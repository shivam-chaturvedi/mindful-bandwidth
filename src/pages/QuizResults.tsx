import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import Translate from '@/components/Translate';
import { calculateQuizScores, quizCategories } from '@/lib/quizData';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ArrowRight, TrendingDown } from 'lucide-react';

const getLevel = (score: number) => {
  if (score >= 70) return { label: 'Strong', color: 'text-success' };
  if (score >= 40) return { label: 'Moderate', color: 'text-warm' };
  return { label: 'Needs Attention', color: 'text-destructive' };
};

const CustomAngleAxisTick = (props: any) => {
  const { x, y, cx, cy, payload, ...rest } = props;
  return (
    <g>
      <text
        x={x}
        y={y}
        cx={cx}
        cy={cy}
        textAnchor={x > cx ? 'start' : x < cx ? 'end' : 'middle'}
        fontSize={10}
        fill="hsl(var(--muted-foreground))"
        {...rest}
      >
        <Translate>{payload.value}</Translate>
      </text>
    </g>
  );
};

const QuizResults = () => {
  const { gameResponses, scores, setScores, language } = useBandwidth();
  const navigate = useNavigate();

  const quizScores = useMemo(() => {
    const answers = gameResponses.quizAnswers || {};
    return calculateQuizScores(answers);
  }, [gameResponses]);

  useMemo(() => {
    setScores({
      planning: quizScores.timeManagement || 0,
      impulseControl: quizScores.selfControl || 0,
      stressRegulation: quizScores.stress || 0,
      socialSupport: quizScores.socialConnectedness || 0,
      financialStress: 100 - (quizScores.financialThreat || 0),
    });
  }, [quizScores]);

  const chartData = [
    { subject: 'Stress Regulation', value: quizScores.stress || 0, fullMark: 100 },
    { subject: 'Self-Control', value: quizScores.selfControl || 0, fullMark: 100 },
    { subject: 'Time Management', value: quizScores.timeManagement || 0, fullMark: 100 },
    { subject: 'Financial Security', value: quizScores.financialThreat || 0, fullMark: 100 },
    { subject: 'Social Connection', value: quizScores.socialConnectedness || 0, fullMark: 100 },
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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider rounded-sm mb-3">
              <Translate>Assessment Complete</Translate>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              <Translate>Your Cognitive Bandwidth Profile</Translate>
            </h1>
            <p className="text-muted-foreground text-sm">
              <Translate>Scores based on 5 validated research scales</Translate>
            </p>
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 mb-4"
          >
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart key={language} data={chartData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={props => <CustomAngleAxisTick {...props} />} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Score cards */}
          <div className="space-y-2 mb-6">
            {dimensions.map((dim, i) => {
              const level = getLevel(dim.score);
              return (
                <motion.div
                  key={dim.key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground"><Translate>{dim.label}</Translate></p>
                      <p className="text-[10px] text-muted-foreground"><Translate>{dim.description}</Translate></p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">{dim.score}</span>
                      <span className={`text-[10px] font-semibold ${level.color}`}><Translate>{level.label}</Translate></span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-sm bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${dim.score}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card-elevated p-6 mb-4"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-sm bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5"><Translate>Primary area for growth</Translate></p>
                <p className="text-base font-bold text-foreground"><Translate>{lowest.label}</Translate></p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              <Translate>Next, you'll complete 4 interactive decision challenges to see how these patterns play out in real-time scenarios.</Translate>
            </p>
            <button
              onClick={() => navigate('/home')}
              className="w-full gradient-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Translate>Go to Dashboard</Translate>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default QuizResults;
