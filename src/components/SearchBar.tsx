import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); onChange(''); }
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onChange]);

  return (
    <div className="relative flex items-center">
      {/* Search icon button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(prev => !prev)}
        className="p-2 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Qidirish"
      >
        <Search className="w-5 h-5" />
      </motion.button>

      {/* Floating search input */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
              onClick={() => { setOpen(false); onChange(''); }}
            />

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[500px] md:right-auto z-50"
            >
              <div className="relative bg-card border border-border/50 rounded-2xl shadow-2xl shadow-background/80 overflow-hidden">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  placeholder="Kanal qidirish..."
                  className="w-full pl-12 pr-12 py-4 bg-transparent text-foreground text-base placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  onClick={() => { setOpen(false); onChange(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
