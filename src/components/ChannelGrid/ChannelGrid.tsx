import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ChannelCard } from './ChannelCard';
import type { Channel } from '@/lib/parser';

const INITIAL_COUNT = 14;

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
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        Kanallar topilmadi
      </div>
    );
  }

  const showToggle = channels.length > INITIAL_COUNT;
  const visible = expanded ? channels : channels.slice(0, INITIAL_COUNT);

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
        <AnimatePresence initial={false}>
          {visible.map((channel, i) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: i >= INITIAL_COUNT ? (i - INITIAL_COUNT) * 0.02 : 0 }}
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
        </AnimatePresence>
      </div>

      {showToggle && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
          </button>
        </div>
      )}
    </div>
  );
};
