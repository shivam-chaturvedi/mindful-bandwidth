import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ArrowRight, Brain, Clock, Zap, Users, DollarSign } from 'lucide-react';

const getLevel = (score: number) => {
  if (score >= 70) return { label: 'Strong', color: 'text-success' };
  if (score >= 40) return { label: 'Moderate', color: 'text-warm' };
  return { label: 'Needs Attention', color: 'text-destructive' };
};

const getInsight = (key: string, score: number) => {
  const insights: Record<string, Record<string, string>> = {
    planning: {
      low: "When you're under pressure, you tend to focus on urgent tasks and ignore long-term ones. This is a natural tunneling effect of stress.",
      mid: "You balance urgency and importance fairly well, but stress can still narrow your focus when things pile up.",
      high: "You prioritize effectively even under pressure — a sign of strong executive function and planning skills.",
    },
    impulseControl: {
      low: "You tend to choose immediate rewards over larger future ones. Under scarcity, this pattern intensifies.",
      mid: "You can delay gratification sometimes, but pressure makes instant options more tempting.",
      high: "You consistently choose long-term value over short-term gains — strong impulse regulation.",
    },
    stressRegulation: {
      low: "Your cognitive performance drops significantly under stress. This 'bandwidth tax' is common but manageable.",
      mid: "Stress affects your performance somewhat. Building stress resilience can help protect your thinking.",
      high: "You maintain clear thinking even under pressure — your stress regulation skills are solid.",
    },
    socialSupport: {
      low: "You may be taking on too much alone. Learning to set boundaries and seek help can free up mental bandwidth.",
      mid: "You handle social demands reasonably, but could benefit from stronger boundary-setting strategies.",
      high: "You navigate social demands well, knowing when to help and when to prioritize yourself.",
    },
    financialStress: {
      low: "Financial concerns may be occupying mental bandwidth that could go toward planning and focus.",
      mid: "Financial pressure is moderate — building small financial buffers can reduce cognitive load.",
      high: "Financial stress appears low for you right now — one less drain on your mental bandwidth.",
    },
  };
  const level = score < 40 ? 'low' : score < 70 ? 'mid' : 'high';
  return insights[key]?.[level] || '';
};

const Results = () => {
  const { scores } = useBandwidth();
  const navigate = useNavigate();

  const chartData = [
    { subject: 'Planning', value: scores.planning, fullMark: 100 },
    { subject: 'Impulse Control', value: scores.impulseControl, fullMark: 100 },
    { subject: 'Stress Regulation', value: scores.stressRegulation, fullMark: 100 },
    { subject: 'Social Support', value: scores.socialSupport, fullMark: 100 },
    { subject: 'Financial', value: 100 - scores.financialStress, fullMark: 100 },
  ];

  const dimensions = [
    { key: 'planning', label: 'Planning Ability', score: scores.planning, icon: Clock },
    { key: 'impulseControl', label: 'Impulse Control', score: scores.impulseControl, icon: Zap },
    { key: 'stressRegulation', label: 'Stress Regulation', score: scores.stressRegulation, icon: Brain },
    { key: 'socialSupport', label: 'Social Support', score: scores.socialSupport, icon: Users },
    { key: 'financialStress', label: 'Financial Pressure', score: 100 - scores.financialStress, icon: DollarSign },
  ];

  // Find lowest scoring area
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
              Here's how your mind works under pressure
            </h1>
            <p className="text-muted-foreground text-sm">
              Based on your choices and responses
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

          {/* Insight Cards */}
          <div className="space-y-3 mb-8">
            {dimensions.map((dim, i) => {
              const level = getLevel(dim.score);
              const Icon = dim.icon;
              return (
                <motion.div
                  key={dim.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{dim.label}</p>
                    </div>
                    <span className={`text-xs font-bold ${level.color}`}>{level.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-12">
                    {getInsight(dim.key, dim.score)}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card-elevated p-6 text-center mb-6"
          >
            <p className="text-sm text-muted-foreground mb-2">Your biggest area for growth:</p>
            <p className="text-lg font-extrabold text-foreground mb-4">{lowest.label}</p>
            <button
              onClick={() => navigate('/interventions')}
              className="gradient-primary text-primary-foreground px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 inline-flex items-center gap-2"
            >
              Get your action plan
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('/breathing')}
              className="px-5 py-2.5 rounded-xl border-2 border-border bg-card text-foreground font-semibold text-sm hover:border-primary/30 transition-all"
            >
              🫁 Breathing Tool
            </button>
            <button
              onClick={() => navigate('/community')}
              className="px-5 py-2.5 rounded-xl border-2 border-border bg-card text-foreground font-semibold text-sm hover:border-primary/30 transition-all"
            >
              👥 Join Community
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Results;
