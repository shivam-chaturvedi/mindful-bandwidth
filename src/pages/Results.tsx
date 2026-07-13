import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import Translate from '@/components/Translate';
import { calculateQuizScores } from '@/lib/quizData';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ArrowRight, Brain, Clock, Zap, Users, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';

const getLevel = (score: number) => {
  if (score >= 70) return { label: 'Strong', color: 'text-success' };
  if (score >= 40) return { label: 'Moderate', color: 'text-warm' };
  return { label: 'Needs Attention', color: 'text-destructive' };
};

const getInsight = (key: string, score: number) => {
  const insights: Record<string, Record<string, string>> = {
    timeManagement: {
      low: "When you're under pressure, you tend to focus on urgent tasks and ignore long-term ones. This is a natural tunneling effect of stress.",
      mid: "You balance urgency and importance fairly well, but stress can still narrow your focus when things pile up.",
      high: "You prioritize effectively even under pressure — a sign of strong executive function and planning skills.",
    },
    selfControl: {
      low: "You tend to choose immediate rewards over larger future ones. Under scarcity, this pattern intensifies.",
      mid: "You can delay gratification sometimes, but pressure makes instant options more tempting.",
      high: "You consistently choose long-term value over short-term gains — strong impulse regulation.",
    },
    stress: {
      low: "Your cognitive performance drops significantly under stress. This 'bandwidth tax' is common but manageable.",
      mid: "Stress affects your performance somewhat. Building stress resilience can help protect your thinking.",
      high: "You maintain clear thinking even under pressure — your stress regulation skills are solid.",
    },
    socialConnectedness: {
      low: "You may be taking on too much alone. Learning to set boundaries and seek help can free up mental bandwidth.",
      mid: "You handle social demands reasonably, but could benefit from stronger boundary-setting strategies.",
      high: "You navigate social demands well, knowing when to help and when to prioritize yourself.",
    },
    financialThreat: {
      low: "Financial concerns may be occupying mental bandwidth that could go toward planning and focus.",
      mid: "Financial pressure is moderate — building small financial buffers can reduce cognitive load.",
      high: "Financial stress appears low for you right now — one less drain on your mental bandwidth.",
    },
  };
  const level = score < 40 ? 'low' : score < 70 ? 'mid' : 'high';
  return insights[key]?.[level] || '';
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

const Results = () => {
  const { gameResponses, setGameResponse, language } = useBandwidth();
  const navigate = useNavigate();

  // Compute scores directly from quiz answers (persisted in gameResponses or localStorage)
  const quizScores = useMemo(() => {
    let answers = gameResponses.quizAnswers || {};
    if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
      try {
        const stored = localStorage.getItem('quizAnswers');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') answers = parsed;
        }
      } catch { /* ignore */ }
    }
    return calculateQuizScores(answers && typeof answers === 'object' ? answers : {});
  }, [gameResponses]);

  const scoreHistory = useMemo(() => {
    try {
      const stored = localStorage.getItem('quiz_scores_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }, [gameResponses]);

  // Initialize history if scores exist but history is empty
  useEffect(() => {
    if (quizScores && Object.keys(quizScores).length > 0) {
      try {
        const storedHistory = localStorage.getItem('quiz_scores_history');
        if (!storedHistory) {
          const initialHistory = [{
            date: 'First Check-in',
            timestamp: Date.now() - 10000,
            scores: quizScores,
            overall: Math.round((quizScores.stress + quizScores.selfControl + quizScores.timeManagement + quizScores.financialThreat + quizScores.socialConnectedness) / 5)
          }];
          localStorage.setItem('quiz_scores_history', JSON.stringify(initialHistory));
          setGameResponse('quiz_scores_history_init', Date.now());
        }
      } catch {}
    }
  }, [quizScores, setGameResponse]);

  const chartData = [
    { subject: 'Stress Regulation', value: quizScores.stress || 0, fullMark: 100 },
    { subject: 'Self-Control', value: quizScores.selfControl || 0, fullMark: 100 },
    { subject: 'Time Management', value: quizScores.timeManagement || 0, fullMark: 100 },
    { subject: 'Financial Security', value: quizScores.financialThreat || 0, fullMark: 100 },
    { subject: 'Social Connection', value: quizScores.socialConnectedness || 0, fullMark: 100 },
  ];

  const dimensions = [
    { key: 'timeManagement', label: 'Time Management', score: quizScores.timeManagement || 0, icon: Clock },
    { key: 'selfControl', label: 'Self-Control', score: quizScores.selfControl || 0, icon: Zap },
    { key: 'stress', label: 'Stress Regulation', score: quizScores.stress || 0, icon: Brain },
    { key: 'socialConnectedness', label: 'Social Connection', score: quizScores.socialConnectedness || 0, icon: Users },
    { key: 'financialThreat', label: 'Financial Security', score: quizScores.financialThreat || 0, icon: DollarSign },
  ];

  const lowest = dimensions.reduce((a, b) => a.score < b.score ? a : b);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-8 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-success/10 text-success text-[10px] font-semibold uppercase tracking-wider rounded-sm mb-3">
              <TrendingUp className="w-3 h-3" />
              <Translate>Analysis Complete</Translate>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              <Translate>How your mind works under pressure</Translate>
            </h1>
            <p className="text-muted-foreground text-sm">
              <Translate>Combined assessment and behavioral analysis</Translate>
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

          {/* Progress Tracker (Only shown if history has > 0 entries) */}
          {scoreHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card p-5 mb-4"
            >
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                <Translate>Bandwidth Progress Tracker</Translate>
              </h2>
              
              {/* Timeline of past scores */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {scoreHistory.slice().reverse().map((entry: any, index: number) => (
                  <div key={entry.timestamp || index} className="flex items-center justify-between p-3 rounded-md border border-border/60 bg-card/40 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-foreground">
                        <Translate>{entry.date}</Translate>
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        <Translate>Stress</Translate>: {Math.round(entry.scores?.stress || 0)}% | <Translate>Self-Control</Translate>: {Math.round(entry.scores?.selfControl || 0)}% | <Translate>Planning</Translate>: {Math.round(entry.scores?.timeManagement || 0)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-primary">{entry.overall || 0}</span>
                      <span className="text-[9px] text-muted-foreground block"><Translate>Overall</Translate></span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Insight Cards */}
          <div className="space-y-2 mb-6">
            {dimensions.map((dim, i) => {
              const level = getLevel(dim.score);
              const Icon = dim.icon;
              return (
                <motion.div
                  key={dim.key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        <Translate>{dim.label}</Translate>
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold ${level.color}`}>
                      <Translate>{level.label}</Translate>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-11">
                    <Translate>{getInsight(dim.key, dim.score)}</Translate>
                  </p>
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
            <p className="text-xs text-muted-foreground mb-1">
              <Translate>Your biggest area for growth</Translate>
            </p>
            <p className="text-lg font-bold text-foreground mb-4">
              <Translate>{lowest.label}</Translate>
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => navigate('/ai-coach')}
                className="flex-1 gradient-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Translate>Talk to Your AI Coach</Translate>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('quizAnswers');
                  localStorage.removeItem('quizScores');
                  setGameResponse('quizAnswers', {});
                  navigate('/quiz');
                }}
                className="flex-1 px-4 py-2.5 rounded-md border border-border bg-card text-foreground font-medium text-sm hover:border-primary/30 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <Translate>Retake Assessment</Translate>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Results;
