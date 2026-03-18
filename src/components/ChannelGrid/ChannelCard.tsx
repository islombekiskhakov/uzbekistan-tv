import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { Channel } from '@/lib/parser';

interface Props {
  channel: Channel;
  onClick: (channel: Channel) => void;
  index: number;
}

export const ChannelCard: React.FC<Props> = ({ channel, onClick, index }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
      onClick={() => onClick(channel)}
      className="group relative flex flex-col items-center gap-3 p-4 rounded-xl glass hover:border-primary/30 transition-all duration-300 hover:glow-sm cursor-pointer text-left w-full"
    >
      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
        {!imgError && channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-xl font-display font-bold text-muted-foreground">
            {channel.name.charAt(0)}
          </span>
        )}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Play className="w-6 h-6 text-primary fill-primary" />
        </div>
      </div>
      <span className="text-xs md:text-sm font-medium text-foreground text-center leading-tight line-clamp-2 w-full">
        {channel.name}
      </span>
    </motion.button>
  );
};
