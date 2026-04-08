import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FloatingShapes from '@/components/FloatingShapes';
import PageTransition from '@/components/PageTransition';
import { ArrowRight, Brain, BarChart3, Users } from 'lucide-react';

const Intro = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 mb-6"
          >
            <div className="w-12 h-12 rounded-md gradient-primary flex items-center justify-center mb-6">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-3 leading-tight">
              Your brain works differently under pressure
            </h1>

            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Research shows that stress and scarcity can reduce cognitive performance by up to 13 IQ points. Let's understand how your mind handles pressure through a series of validated assessments and interactive challenges.
            </p>

            {/* What you'll do */}
            <div className="space-y-3 mb-6">
              {[
                { icon: BarChart3, label: '56 research-backed questions', sub: 'Across 5 cognitive domains' },
                { icon: Brain, label: '4 decision challenges', sub: 'See how you act under pressure' },
                { icon: Users, label: 'Personalized insights', sub: 'With evidence-based interventions' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => navigate('/quiz')}
              className="w-full gradient-primary text-primary-foreground py-3 rounded-md font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2"
            >
              Start Assessment
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-muted-foreground mt-3 text-center">
              Takes about 10–15 minutes · No right or wrong answers
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Intro;
