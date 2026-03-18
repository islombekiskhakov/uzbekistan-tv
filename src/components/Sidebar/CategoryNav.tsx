import React from 'react';
import { motion } from 'framer-motion';
import { Tv, Film, Newspaper, Baby, Trophy, Music, Sparkles, GraduationCap, FlaskConical, LayoutGrid } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Milliy': <Tv className="w-4 h-4" />,
  'Kino': <Film className="w-4 h-4" />,
  'Yangiliklar': <Newspaper className="w-4 h-4" />,
  'Bolalar uchun': <Baby className="w-4 h-4" />,
  'Sport': <Trophy className="w-4 h-4" />,
  'Musiqiy': <Music className="w-4 h-4" />,
  "Ko'ngil Ochar": <Sparkles className="w-4 h-4" />,
  "Ta'lim": <GraduationCap className="w-4 h-4" />,
  "Ta'lim va ilm fan": <FlaskConical className="w-4 h-4" />,
};

interface Props {
  categories: string[];
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
  channelCounts: Record<string, number>;
}

export const CategoryNav: React.FC<Props> = ({ categories, activeCategory, onSelect, channelCounts }) => {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelect(null)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
          activeCategory === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        Barchasi
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
            activeCategory === cat
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {CATEGORY_ICONS[cat] || <Tv className="w-4 h-4" />}
          {cat}
          <span className="text-[10px] opacity-60">{channelCounts[cat] || 0}</span>
        </button>
      ))}
    </nav>
  );
};
