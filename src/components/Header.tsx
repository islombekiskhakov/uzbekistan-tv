import React from 'react';
import { Tv } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center gap-3 mb-2">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 glow-sm">
        <Tv className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
          Uzbekistan<span className="text-primary">TV</span>
        </h1>
        <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Jonli Efir</p>
      </div>
    </header>
  );
};