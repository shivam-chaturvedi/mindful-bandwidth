import { motion } from 'framer-motion';

const FloatingShapes = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {/* Subtle geometric grid dots */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }} />
    {/* Subtle accent blocks */}
    <motion.div
      className="absolute top-16 right-12 w-24 h-24 border border-primary/10 rounded-sm"
      animate={{ opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-24 left-8 w-16 h-16 bg-primary/[0.03] rounded-sm"
      animate={{ opacity: [0.4, 0.6, 0.4] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/3 left-1/4 w-1 h-20 bg-border/50"
      animate={{ opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

export default FloatingShapes;
