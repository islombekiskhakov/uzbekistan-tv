import React from 'react';
import { motion } from 'framer-motion';
import { Tv, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-4"
    >
      <motion.div
        className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 glow-md overflow-hidden"
        whileHover={{ scale: 1.05, rotate: 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
        <Tv className="w-6 h-6 text-primary relative z-10" />
      </motion.div>
      <div>
        <h1 className="text-2xl font-display font-extrabold tracking-tight">
          <span className="text-foreground">Uzbekistan</span>
          <span className="text-gradient">TV</span>
        </h1>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-accent" />
          <p className="text-[10px] text-muted-foreground font-semibold tracking-[0.2em] uppercase">Jonli Efir</p>
        </div>
      </div>
    </motion.header>
  );
};
