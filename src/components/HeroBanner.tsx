import React from 'react';
import { motion } from 'framer-motion';
import { Play, Radio } from 'lucide-react';
import type { Channel } from '@/lib/parser';
import { ChannelEPG, getCurrentProgram, formatTime } from '@/lib/epg';

interface Props {
  channels: Channel[];
  epgData: ChannelEPG[];
  onSelect: (channel: Channel) => void;
}

export const HeroBanner: React.FC<Props> = ({ channels, epgData, onSelect }) => {
  // Pick top 4 channels that have live programs
  const epgMap = new Map(epgData.map(e => [e.channelId, e]));
  const featured = channels
    .filter(c => {
      const epg = epgMap.get(c.id);
      return epg && getCurrentProgram(epg);
    })
    .slice(0, 4);

  if (featured.length === 0) return null;

  const main = featured[0];
  const mainEpg = epgMap.get(main.id)!;
  const mainProgram = getCurrentProgram(mainEpg)!;

  return (
    <div className="px-4 md:px-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Main featured */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          onClick={() => onSelect(main)}
          className="lg:col-span-2 relative h-[220px] md:h-[280px] rounded-3xl overflow-hidden cursor-pointer group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-accent/10" />
          {main.logo && (
            <img
              src={main.logo}
              alt={main.name}
              className="absolute top-1/2 right-8 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 object-contain opacity-20 group-hover:opacity-30 transition-opacity duration-500 group-hover:scale-105 transition-transform"
            />
          )}
          <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/90 text-destructive-foreground text-[10px] font-bold uppercase tracking-wider">
                <Radio className="w-3 h-3 animate-pulse-glow" />
                Jonli
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-foreground mb-1">{main.name}</h2>
            <p className="text-sm text-foreground/60 mb-4">
              {mainProgram.title} · {formatTime(mainProgram.endTime)} gacha
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 w-fit px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold glow-sm hover:glow-md transition-shadow"
            >
              <Play className="w-4 h-4 fill-current" />
              Tomosha qilish
            </motion.button>
          </div>
        </motion.div>

        {/* Side cards */}
        <div className="flex lg:flex-col gap-3">
          {featured.slice(1, 4).map((channel, i) => {
            const epg = epgMap.get(channel.id);
            const program = epg ? getCurrentProgram(epg) : null;
            return (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                onClick={() => onSelect(channel)}
                className="flex-1 relative rounded-2xl overflow-hidden bg-card border border-border/30 cursor-pointer group hover:border-primary/30 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-card via-card/90 to-transparent" />
                {channel.logo && (
                  <img
                    src={channel.logo}
                    alt=""
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-14 h-14 object-contain opacity-15 group-hover:opacity-25 transition-opacity"
                  />
                )}
                <div className="relative p-4 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Radio className="w-2.5 h-2.5 text-primary animate-pulse-glow" />
                    <span className="text-[10px] text-primary font-bold uppercase">Jonli</span>
                  </div>
                  <p className="text-sm font-bold text-foreground truncate">{channel.name}</p>
                  {program && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{program.title}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
