import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hoverEffect?: boolean;
}

export function GlassCard({ className, children, hoverEffect = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "glass-panel rounded-2xl relative overflow-hidden",
        hoverEffect && "hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] hover:border-primary/30 transition-all duration-300",
        className
      )}
      {...props}
    >
      {/* Subtle top glare effect */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </motion.div>
  );
}
