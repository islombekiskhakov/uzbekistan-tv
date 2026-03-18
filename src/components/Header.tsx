import React from 'react';
import { motion } from 'framer-motion';
import { Tv, Zap } from 'lucide-react';

export const Header: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/30"
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
        <a href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Tv className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-display font-extrabold tracking-tight leading-none">
              <span className="text-foreground">Uzbekistan</span>
              <span className="text-gradient">TV</span>
            </h1>
          </div>
        </a>
        {children}
      </div>
    </motion.header>
  );
};
