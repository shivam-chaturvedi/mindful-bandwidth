import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import Translate from '@/components/Translate';
import { getSolutionById, Solution } from '@/lib/solutions';
import { ArrowRight, Target, Trash2, CalendarDays, CheckCircle2, Bookmark } from 'lucide-react';

const Interventions = () => {
  const { language } = useBandwidth();
  const navigate = useNavigate();
  const [pinnedSolutions, setPinnedSolutions] = useState<Solution[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('action_plan_completed_steps');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Load pinned solutions from localStorage
  useEffect(() => {
    const loadPinned = () => {
      try {
        const stored = localStorage.getItem('pinned_solutions');
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          if (Array.isArray(ids)) {
            const sols = ids
              .map(id => getSolutionById(id))
              .filter((s): s is Solution => !!s);
            setPinnedSolutions(sols);
            return;
          }
        }
      } catch {}
      setPinnedSolutions([]);
    };

    loadPinned();
  }, []);

  const handleUnpin = (solId: string) => {
    const nextPinned = pinnedSolutions.filter(s => s.id !== solId);
    setPinnedSolutions(nextPinned);
    try {
      localStorage.setItem('pinned_solutions', JSON.stringify(nextPinned.map(s => s.id)));
    } catch {}
  };

  const toggleStep = (solId: string, stepIdx: number) => {
    const key = `${solId}-${stepIdx}`;
    const next = { ...completedSteps, [key]: !completedSteps[key] };
    setCompletedSteps(next);
    try {
      localStorage.setItem('action_plan_completed_steps', JSON.stringify(next));
    } catch {}
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'stress': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'selfControl': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'timeManagement': return 'bg-primary/10 text-primary border-primary/20';
      case 'financialThreat': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'socialConnectedness': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center px-4 py-8 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-lg mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider rounded-sm mb-3">
              <Target className="w-3 h-3" /> <Translate>My Action Plan</Translate>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              <Translate>Your Personalised Strategies</Translate>
            </h1>
            <p className="text-muted-foreground text-sm">
              <Translate>Evidence-based interventions pinned from your AI Coach discussions.</Translate>
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {pinnedSolutions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass-card-elevated p-8 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  <Translate>No pinned strategies yet</Translate>
                </h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  <Translate>Discuss your stressors with your AI Coach to find personalized strategies, then pin them here to build your actionable plan.</Translate>
                </p>
                <button
                  onClick={() => navigate('/ai-coach')}
                  className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-md font-semibold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <Translate>Talk to AI Coach</Translate>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {pinnedSolutions.map((sol, idx) => {
                  const totalSteps = sol.steps.length;
                  const completedCount = sol.steps.reduce((acc, _, i) => acc + (completedSteps[`${sol.id}-${i}`] ? 1 : 0), 0);
                  const progressPct = Math.round((completedCount / totalSteps) * 100);

                  return (
                    <motion.div
                      key={sol.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-card-elevated p-6 relative overflow-hidden"
                    >
                      {/* Top labels */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${getCategoryColor(sol.category)}`}>
                            <Translate>{sol.category}</Translate>
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" /> <Translate>{sol.duration}</Translate>
                          </span>
                        </div>
                        <button
                          onClick={() => handleUnpin(sol.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Remove from plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h2 className="text-lg font-bold text-foreground mb-1">
                        <Translate>{sol.title}</Translate>
                      </h2>
                      <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
                        <Translate>{sol.source}</Translate>
                      </p>
                      <p className="text-xs text-foreground mb-5 leading-relaxed bg-muted/30 p-3 rounded-md border border-border/40">
                        <Translate>{sol.description}</Translate>
                      </p>

                      {/* Progress bar */}
                      <div className="mb-5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1.5">
                          <span><Translate>Progress</Translate></span>
                          <span>{completedCount}/{totalSteps} <Translate>steps completed</Translate> ({progressPct}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full gradient-primary rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Steps checklist */}
                      <div className="space-y-2">
                        {sol.steps.map((step, i) => {
                          const isDone = !!completedSteps[`${sol.id}-${i}`];
                          return (
                            <button
                              key={i}
                              onClick={() => toggleStep(sol.id, i)}
                              className={`w-full text-left p-3 rounded-md border flex items-start gap-3 transition-all ${
                                isDone
                                  ? 'border-success/30 bg-success/5 text-muted-foreground line-through'
                                  : 'border-border bg-card hover:border-primary/30 text-foreground'
                              }`}
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-success fill-success/15" />
                                ) : (
                                  <div className="w-4 h-4 rounded-sm border border-border bg-background" />
                                )}
                              </div>
                              <span className="text-xs font-medium leading-normal">
                                <Translate>{step}</Translate>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default Interventions;
