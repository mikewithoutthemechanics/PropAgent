'use client';

import { motion, MotionProps } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { ReactNode } from 'react';

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.4, ease: easeOutExpo },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: easeOutExpo },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: easeOutExpo },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.4, ease: easeOutExpo },
};

export const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
  transition: { duration: 0.5, ease: easeOutExpo },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: easeOutExpo },
};

interface AnimatedProps extends MotionProps {
  className?: string;
  children: ReactNode;
}

export function FadeIn({ className, children, ...props }: AnimatedProps) {
  return (
    <motion.div {...fadeIn} {...props} className={className}>
      {children}
    </motion.div>
  );
}

export function FadeInUp({ className, children, ...props }: AnimatedProps) {
  return (
    <motion.div {...fadeInUp} {...props} className={className}>
      {children}
    </motion.div>
  );
}

export function FadeInDown({ className, children, ...props }: AnimatedProps) {
  return (
    <motion.div {...fadeInDown} {...props} className={className}>
      {children}
    </motion.div>
  );
}

export function ScaleIn({ className, children, ...props }: AnimatedProps) {
  return (
    <motion.div {...scaleIn} {...props} className={className}>
      {children}
    </motion.div>
  );
}

export function SlideInRight({ className, children, ...props }: AnimatedProps) {
  return (
    <motion.div {...slideInRight} {...props} className={className}>
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  className?: string;
  children: ReactNode;
  delay?: number;
}

export function StaggerGroup({ className, children, delay = 0.08 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      variants={{
        animate: {
          transition: {
            staggerChildren: delay,
            delayChildren: 0.1,
          },
        },
      }}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

export function AnimatedCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedButton({ className, children, ...props }: AnimatedProps) {
  return (
    <motion.button
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: easeOutExpo },
};

export function PageTransition({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
      }}
      transition={{ duration: 0.3, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  );
}