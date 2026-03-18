import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart } from 'lucide-react';
import type { Channel } from '@/lib/parser';

interface Props {
  channels: Channel[];
  onSelect: (channel: Channel) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (channelId: string) => void;
}

export const ChannelGrid: React.FC<Props> = ({ channels, onSelect, favorites, onToggleFavorite }) => {
  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <p className="text-sm font-medium">Kanallar topilmadi</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
        {channels.map((channel, i) => (
          <GridTile
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
  );
};

const GridTile: React.FC<{
  channel: Channel;
  index: number;
  onSelect: (c: Channel) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}> = ({ channel, index, onSelect, isFavorite, onToggleFavorite }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.5) }}
      className="group"
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
            <span className="text-xl font-display font-bold text-muted-foreground">{channel.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center glow-sm">
            <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
          </div>
        </div>
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(channel.id); }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-10"
          >
            <Heart className={`w-3 h-3 ${isFavorite ? 'text-accent fill-accent' : 'text-foreground/70'}`} />
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] md:text-xs font-semibold text-foreground/80 text-center truncate">{channel.name}</p>
    </motion.div>
  );
};
