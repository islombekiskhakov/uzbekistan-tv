import React from 'react';
import { ChannelCard } from './ChannelCard';
import type { Channel } from '@/lib/parser';

interface Props {
  channels: Channel[];
  onSelect: (channel: Channel) => void;
}

export const ChannelGrid: React.FC<Props> = ({ channels, onSelect }) => {
  if (channels.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        No channels found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
      {channels.map((channel, i) => (
        <ChannelCard key={channel.id} channel={channel} onClick={onSelect} index={i} />
      ))}
    </div>
  );
};
