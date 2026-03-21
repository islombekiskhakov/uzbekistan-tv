import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Channel } from '@/lib/parser';
import { useTilt3D } from '@/hooks/useTilt3D';

interface Props {
  title: string;
  icon?: React.ReactNode;
  channels: Channel[];
  onSelect: (channel: Channel) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (channelId: string) => void;
}

export const ChannelRow: React.FC<Props> = ({ title, icon, channels, onSelect, favorites, onToggleFavorite }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (channels.length === 0) return null;

  return (
    <div className="relative group/row">
      <div className="flex items-center gap-2.5 mb-3 px-4 md:px-8">
        {icon}
        <h2 className="text-sm md:text-base font-bold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground font-medium">{channels.length}</span>
      </div>

      <div className="relative">
        {/* Scroll arrows */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-background to-transparent flex items-center justify-start pl-2 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-background to-transparent flex items-center justify-end pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 overflow-x-auto scrollbar-none px-4 md:px-8 pb-1"
        >
          {channels.map((channel, i) => (
            <ChannelTile
              key={channel.id}
              channel={channel}
              index={i}
              onSelect={onSelect}
              isFavorite={favorites?.has(channel.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ChannelTile: React.FC<{
  channel: Channel;
  index: number;
  onSelect: (c: Channel) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}> = ({ channel, index, onSelect, isFavorite, onToggleFavorite }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.4) }}
      className="group flex-shrink-0 w-[130px] md:w-[150px]"
    >
      <div
        onClick={() => onSelect(channel)}
        className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border/30 cursor-pointer hover:border-primary/40 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_hsl(var(--glow)/0.2)]"
      >
        {!imgError && channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-2xl font-display font-bold text-muted-foreground">{channel.name.charAt(0)}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center glow-sm">
            <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
          </div>
        </div>

        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(channel.id); }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-10"
          >
            <Heart className={`w-3 h-3 ${isFavorite ? 'text-accent fill-accent' : 'text-foreground/70'}`} />
          </button>
        )}
      </div>
      <p className="mt-2 text-xs font-semibold text-foreground/80 text-center truncate px-1">{channel.name}</p>
    </motion.div>
  );
};
