import React from 'react';
import { motion } from 'framer-motion';
import { Tv, Film, Newspaper, Baby, Trophy, Music, Sparkles, GraduationCap, FlaskConical, LayoutGrid, Heart } from 'lucide-react';

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
  favoritesCount?: number;
  showFavorites?: boolean;
  onToggleFavorites?: () => void;
}

export const CategoryNav: React.FC<Props> = ({ categories, activeCategory, onSelect, channelCounts, favoritesCount = 0, showFavorites, onToggleFavorites }) => {
  const pillClass = (active: boolean) =>
    `relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 overflow-hidden ${
      active
        ? 'bg-primary text-primary-foreground glow-sm'
        : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary hover:text-foreground'
    }`;

  return (
    <nav className="flex gap-2 overflow-x-auto pb-3 scrollbar-none -mx-1 px-1">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => { onSelect(null); if (showFavorites && onToggleFavorites) onToggleFavorites(); }}
        className={pillClass(activeCategory === null && !showFavorites)}
      >
        <LayoutGrid className="w-4 h-4" />
        Barchasi
      </motion.button>

      {favoritesCount > 0 && onToggleFavorites && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { onSelect(null); onToggleFavorites(); }}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 overflow-hidden ${
            showFavorites
              ? 'bg-accent text-accent-foreground glow-sm'
              : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
          Sevimlilar
          <span className="text-[10px] opacity-70 font-bold">{favoritesCount}</span>
        </motion.button>
      )}

      {categories.map((cat, i) => (
        <motion.button
          key={cat}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03, duration: 0.3 }}
          onClick={() => { if (showFavorites && onToggleFavorites) onToggleFavorites(); onSelect(cat); }}
          className={pillClass(activeCategory === cat && !showFavorites)}
        >
          {CATEGORY_ICONS[cat] || <Tv className="w-4 h-4" />}
          {cat}
          <span className="text-[10px] opacity-60 font-bold">{channelCounts[cat] || 0}</span>
        </motion.button>
      ))}
    </nav>
  );
};
