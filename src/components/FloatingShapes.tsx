import { motion } from 'framer-motion';

const FloatingShapes = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <motion.div
      className="absolute top-20 left-10 w-20 h-20 rounded-full bg-sky opacity-60"
      animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-40 right-16 w-14 h-14 rounded-2xl bg-sunshine opacity-50 rotate-12"
      animate={{ y: [10, -10, 10], rotate: [12, -12, 12] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-32 left-20 w-16 h-16 rounded-full bg-mint opacity-50"
      animate={{ y: [-8, 8, -8] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-48 right-10 w-10 h-10 rounded-full bg-blush opacity-40"
      animate={{ y: [5, -15, 5] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/2 left-1/3 w-8 h-8 rounded-lg bg-lavender/30 rotate-45"
      animate={{ y: [-12, 12, -12], rotate: [45, 90, 45] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

export default FloatingShapes;
