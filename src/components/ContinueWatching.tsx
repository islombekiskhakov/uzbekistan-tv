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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3 px-4 md:px-8">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Davom ettirish</h3>
        <button onClick={onClear} className="ml-auto p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none px-4 md:px-8 pb-1">
        {recentChannels.map((channel, i) => (
          <motion.button
            key={channel.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(channel)}
            className="group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border/30 hover:border-primary/30 transition-all flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
              {channel.logo ? (
                <img src={channel.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-[10px] font-bold text-muted-foreground">{channel.name.charAt(0)}</span>
              )}
            </div>
            <span className="text-xs font-semibold text-foreground/80 truncate max-w-[80px]">{channel.name}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
