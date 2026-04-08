import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBandwidth } from '@/context/BandwidthContext';
import FloatingShapes from '@/components/FloatingShapes';
import PageTransition from '@/components/PageTransition';
import { Brain, Target, Clock, Zap, Shield, Sparkles, ArrowRight } from 'lucide-react';

const options = [
  { id: 'stress', label: 'Reduce stress', icon: Brain },
  { id: 'control', label: 'Feel more in control', icon: Target },
  { id: 'procrastinate', label: 'Stop procrastinating', icon: Clock },
  { id: 'decisions', label: 'Make better decisions', icon: Zap },
  { id: 'pressure', label: 'Handle pressure better', icon: Shield },
  { id: 'other', label: 'Something else', icon: Sparkles },
];

const Onboarding = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const { setOnboardingSelections } = useBandwidth();
  const navigate = useNavigate();

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleContinue = () => {
    setOnboardingSelections(selected);
    navigate('/intro');
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-lg">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-sm mb-4">
              <Brain className="w-3.5 h-3.5" />
              BANDWIDTH
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 leading-tight">
              What's on your mind?
            </h1>
            <p className="text-muted-foreground text-sm">
              Select everything that resonates with you.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-2.5 mb-8">
            {options.map((opt, i) => {
              const Icon = opt.icon;
              const isSelected = selected.includes(opt.id);
              return (
                <motion.button
                  key={opt.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  onClick={() => toggle(opt.id)}
                  className={`
                    relative p-4 rounded-md border text-left transition-all duration-150
                    ${isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-card hover:border-primary/40'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mb-2.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium text-foreground block">{opt.label}</span>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-sm bg-primary flex items-center justify-center"
                      >
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleContinue}
              disabled={selected.length === 0}
              className={`
                w-full py-3 rounded-md font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2
                ${selected.length > 0
                  ? 'gradient-primary text-primary-foreground shadow-sm hover:shadow-md'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                }
              `}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Onboarding;
