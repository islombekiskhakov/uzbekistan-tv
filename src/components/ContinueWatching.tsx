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
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Davom ettirish</h3>
        <button onClick={onClear} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {recentChannels.map(channel => (
          <button
            key={channel.id}
            onClick={() => onSelect(channel)}
            className="group flex items-center gap-3 px-3 py-2 rounded-lg glass hover:border-primary/30 transition-all duration-200 flex-shrink-0 min-w-0"
          >
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {channel.logo ? (
                <img src={channel.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-xs font-bold text-muted-foreground">
                  {channel.name.charAt(0)}
                </span>
              )}
              <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-4 h-4 text-primary fill-primary" />
              </div>
            </div>
            <span className="text-xs font-medium text-foreground truncate max-w-[100px]">{channel.name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
