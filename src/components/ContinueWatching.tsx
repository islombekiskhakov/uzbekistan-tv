import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, X } from 'lucide-react';
import type { Channel } from '@/lib/parser';

interface WatchHistoryEntry {
  channelId: string;
  timestamp: number;
}

interface Props {
  history: WatchHistoryEntry[];
  channels: Channel[];
  onSelect: (channel: Channel) => void;
  onClear: () => void;
}

export const ContinueWatching: React.FC<Props> = ({ history, channels, onSelect, onClear }) => {
  if (history.length === 0) return null;

  const channelMap = new Map(channels.map(c => [c.id, c]));
  const recentChannels = history
    .map(h => channelMap.get(h.channelId))
    .filter(Boolean) as Channel[];

  if (recentChannels.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
          <Clock className="w-3.5 h-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Davom ettirish</h3>
        <button onClick={onClear} className="ml-auto p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {recentChannels.map((channel, i) => (
          <motion.button
            key={channel.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(channel)}
            className="group flex items-center gap-3 px-4 py-3 rounded-2xl glass gradient-border hover:glow-sm transition-all duration-300 flex-shrink-0 min-w-0"
          >
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-muted/50 flex-shrink-0 ring-1 ring-border/20">
              {channel.logo ? (
                <img src={channel.logo} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-xs font-bold text-muted-foreground">
                  {channel.name.charAt(0)}
                </span>
              )}
              <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-4 h-4 text-primary fill-primary" />
              </div>
            </div>
            <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground truncate max-w-[100px] transition-colors">{channel.name}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
