import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Heart, Tv, Film, Newspaper, Baby, Trophy, Music, Sparkles, GraduationCap, FlaskConical } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Milliy': <Tv className="w-3.5 h-3.5" />,
  'Kino': <Film className="w-3.5 h-3.5" />,
  'Yangiliklar': <Newspaper className="w-3.5 h-3.5" />,
  'Bolalar uchun': <Baby className="w-3.5 h-3.5" />,
  'Sport': <Trophy className="w-3.5 h-3.5" />,
  'Musiqiy': <Music className="w-3.5 h-3.5" />,
  "Ko'ngil Ochar": <Sparkles className="w-3.5 h-3.5" />,
  "Ta'lim": <GraduationCap className="w-3.5 h-3.5" />,
  "Ta'lim va ilm fan": <FlaskConical className="w-3.5 h-3.5" />,
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
  const pill = (active: boolean, variant?: 'accent') =>
    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
      active
        ? variant === 'accent'
          ? 'bg-accent text-accent-foreground'
          : 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
    }`;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none px-4 md:px-8 py-1">
      <button
        onClick={() => { onSelect(null); if (showFavorites && onToggleFavorites) onToggleFavorites(); }}
        className={pill(activeCategory === null && !showFavorites)}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        Barchasi
      </button>

      {favoritesCount > 0 && onToggleFavorites && (
        <button
          onClick={() => { onSelect(null); onToggleFavorites(); }}
          className={pill(!!showFavorites, 'accent')}
        >
          <Heart className={`w-3.5 h-3.5 ${showFavorites ? 'fill-current' : ''}`} />
          Sevimlilar
        </button>
      )}

      <div className="w-px h-5 bg-border/50 flex-shrink-0 mx-1" />

      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => { if (showFavorites && onToggleFavorites) onToggleFavorites(); onSelect(cat); }}
          className={pill(activeCategory === cat && !showFavorites)}
        >
          {CATEGORY_ICONS[cat] || <Tv className="w-3.5 h-3.5" />}
          {cat}
        </button>
      ))}
    </div>
  );
};
