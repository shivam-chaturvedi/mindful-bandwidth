import { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import FloatingShapes from '@/components/FloatingShapes';
import { Users, Flame, MessageCircle, Target, Calendar, Heart, ClipboardList, BookOpen, Brain, Zap, Handshake } from 'lucide-react';

const weeklyFocus = [
  { week: 1, label: 'Planning', icon: BookOpen, active: true },
  { week: 2, label: 'Stress', icon: Brain, active: false },
  { week: 3, label: 'Decisions', icon: Zap, active: false },
  { week: 4, label: 'Support', icon: Handshake, active: false },
];

const posts = [
  { id: 1, text: 'I finally planned my day properly for the first time in weeks.', time: '2h ago', likes: 14 },
  { id: 2, text: 'Still struggling with distractions but the breathing tool helps.', time: '4h ago', likes: 23 },
  { id: 3, text: 'Realized I say yes to everything — working on boundaries.', time: '6h ago', likes: 31 },
  { id: 4, text: 'Day 5 streak. Small wins add up.', time: '8h ago', likes: 19 },
];

const Community = () => {
  const [joined, setJoined] = useState(false);

  return (
    <PageTransition>
      <div className="px-4 py-8 relative">
        <FloatingShapes />
        <div className="relative z-10 w-full max-w-lg mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Bandwidth Challenge</h1>
            <p className="text-xs text-muted-foreground">4-week peer-supported program</p>
          </div>

          {!joined ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                className="glass-card-elevated p-8 text-center mb-6"
            >
                <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">1,284</p>
              <p className="text-sm text-muted-foreground mb-6">
                students are improving their focus right now
              </p>
              <button
                onClick={() => setJoined(true)}
                  className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-md font-semibold text-sm shadow-sm hover:shadow-md transition-all"
              >
                Join the 4-week Challenge
              </button>
            </motion.div>
          ) : (
            <>
              {/* Streak */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 mb-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-md bg-warm/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-warm" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Day 3 / 28</p>
                  <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                    <div className="h-full gradient-warm rounded-full" style={{ width: '10.7%' }} />
                  </div>
                </div>
                <span className="text-xs font-semibold text-warm flex items-center gap-1"><Flame className="w-3 h-3" />3 streak</span>
              </motion.div>

              {/* Weekly Focus */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-4 mb-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> WEEKLY FOCUS
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {weeklyFocus.map(w => {
                    const Icon = w.icon;
                    return (
                      <div
                        key={w.week}
                        className={`p-2 rounded-md text-center border ${
                          w.active ? 'bg-primary/5 border-primary/30' : 'bg-card border-border'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mx-auto ${w.active ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className={`text-[10px] font-semibold mt-1 ${w.active ? 'text-primary' : 'text-muted-foreground'}`}>
                          Wk {w.week}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Reflection Prompt */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-4 mb-4 border-l-4 border-l-primary"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1 flex items-center gap-1">
                  <Target className="w-3 h-3" /> WEEKLY REFLECTION
                </p>
                <p className="text-sm font-medium text-foreground">
                  "Did you make one better decision this week?"
                </p>
              </motion.div>

              {/* Anonymous Feed */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> COMMUNITY FEED
                </p>
                <div className="space-y-2">
                  {posts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                      className="glass-card p-3"
                    >
                      <p className="text-sm text-foreground">{post.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">{post.time}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Community;
