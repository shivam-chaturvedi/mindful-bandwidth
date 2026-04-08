import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

const ProgressBar = ({ current, total, label }: ProgressBarProps) => (
  <div className="w-full max-w-md mx-auto mb-6">
    {label && <p className="text-sm font-medium text-muted-foreground mb-2 text-center">{label}</p>}
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full gradient-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
    <p className="text-xs text-muted-foreground mt-1 text-center">{current} of {total}</p>
  </div>
);

export default ProgressBar;
