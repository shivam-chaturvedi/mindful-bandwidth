import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

const ProgressBar = ({ current, total, label }: ProgressBarProps) => (
  <div className="w-full max-w-md mx-auto mb-6">
    {label && <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>}
    <div className="h-1 bg-muted rounded-sm overflow-hidden">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
    <p className="text-[10px] text-muted-foreground mt-1">{current} of {total}</p>
  </div>
);

export default ProgressBar;
