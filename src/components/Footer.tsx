import React from 'react';
import { Tv } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-border/20 pt-8 pb-6 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-primary" />
            <span className="font-display font-extrabold text-foreground">
              Uzbekistan<span className="text-gradient">TV</span>
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground max-w-md">
            O'zbekistonning eng qulay onlayn TV platformasi — 200+ telekanal, bepul, HD sifatda
          </p>
        </div>
        <div className="text-[10px] text-muted-foreground/50 text-center border-t border-border/10 pt-4">
          © {new Date().getFullYear()} UzbekistanTV
        </div>
      </div>
    </footer>
  );
};
