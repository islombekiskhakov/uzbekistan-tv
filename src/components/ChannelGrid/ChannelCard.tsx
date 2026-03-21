import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart } from 'lucide-react';
import type { Channel } from '@/lib/parser';
import { useTilt3D } from '@/hooks/useTilt3D';

interface Props {
  channel: Channel;
  onClick: (channel: Channel) => void;
  index: number;
  isFavorite?: boolean;
  onToggleFavorite?: (channelId: string) => void;
}

export const ChannelCard: React.FC<Props> = ({ channel, onClick, index, isFavorite, onToggleFavorite }) => {
  const [imgError, setImgError] = useState(false);
  const { ref, style: tilt, handleMouseMove, handleMouseLeave } = useTilt3D(10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.5), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl glass gradient-border cursor-pointer text-left w-full hover:glow-sm transition-shadow duration-300"
      style={{ perspective: 600 }}
    >
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => onClick(channel)}
        className="relative w-full flex flex-col items-center gap-3"
      >
        <motion.div
          animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-muted/50 flex items-center justify-center flex-shrink-0 ring-1 ring-border/30"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {!imgError && channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-xl font-display font-bold text-muted-foreground">
              {channel.name.charAt(0)}
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <motion.div
              initial={false}
              whileHover={{ scale: 1.1 }}
              className="w-9 h-9 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm glow-sm"
            >
              <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
            </motion.div>
          </div>
        </motion.div>
        <span className="text-xs md:text-sm font-semibold text-foreground/90 text-center leading-tight line-clamp-2 w-full group-hover:text-foreground transition-colors">
          {channel.name}
        </span>
      </div>

      {onToggleFavorite && (
        <motion.button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(channel.id); }}
          whileTap={{ scale: 0.8 }}
          className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-background/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200"
          aria-label={isFavorite ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
        >
          <Heart className={`w-3.5 h-3.5 transition-all duration-200 ${isFavorite ? 'text-accent fill-accent scale-110' : 'text-muted-foreground hover:text-accent'}`} />
        </motion.button>
      )}
    </motion.div>
  );
};
