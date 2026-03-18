import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ChannelCard } from './ChannelCard';
import type { Channel } from '@/lib/parser';

const INITIAL_COUNT = 28;

interface Props {
  channels: Channel[];
  onSelect: (channel: Channel) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (channelId: string) => void;
}

export const ChannelGrid: React.FC<Props> = ({ channels, onSelect, favorites, onToggleFavorite }) => {
  const [expanded, setExpanded] = useState(false);

  if (channels.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-20 text-muted-foreground text-sm"
      >
        Kanallar topilmadi
      </motion.div>
    );
  }

  const showToggle = channels.length > INITIAL_COUNT;
  const visible = expanded ? channels : channels.slice(0, INITIAL_COUNT);

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
        {visible.map((channel, i) => (
          <motion.div
            key={channel.id}
            initial={i >= INITIAL_COUNT ? { opacity: 0, scale: 0.9 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: i >= INITIAL_COUNT ? (i - INITIAL_COUNT) * 0.015 : 0 }}
          >
            <ChannelCard
              channel={channel}
              onClick={onSelect}
              index={i}
              isFavorite={favorites?.has(channel.id)}
              onToggleFavorite={onToggleFavorite}
            />
          </motion.div>
        ))}
      </div>

      {showToggle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setExpanded(prev => !prev)}
            className="flex items-center gap-2.5 px-8 py-3 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border/30 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-300 hover:glow-sm"
          >
            {expanded ? (
              <>
                Yashirish <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Barchasini ko'rish ({channels.length}) <ChevronDown className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};
