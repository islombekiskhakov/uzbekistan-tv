import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, Radio, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import type { Channel } from '@/lib/parser';
import { ChannelEPG, getCurrentProgram, getUpcomingPrograms, formatTime, Program } from '@/lib/epg';

interface Props {
  channels: Channel[];
  epgData: ChannelEPG[];
  onSelectChannel: (channel: Channel) => void;
}

const ProgramRow: React.FC<{ program: Program; compact?: boolean }> = ({ program, compact }) => {
  const isPast = program.progress === 100 && !program.isLive;

  return (
    <div className={`flex items-center gap-3 py-1.5 ${isPast ? 'opacity-30' : ''}`}>
      <span className={`text-[11px] font-mono flex-shrink-0 ${program.isLive ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
        {formatTime(program.startTime)}
      </span>
      {program.isLive && (
        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
      )}
      <span className={`text-xs truncate ${program.isLive ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
        {program.title}
      </span>
      {program.isLive && !compact && (
        <span className="ml-auto text-[9px] text-primary font-bold flex-shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-full">
          {program.progress}%
        </span>
      )}
    </div>
  );
};

const ChannelEPGRow: React.FC<{
  channel: Channel;
  epg: ChannelEPG;
  onSelect: (channel: Channel) => void;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ channel, epg, onSelect, isExpanded, onToggle }) => {
  const currentProgram = getCurrentProgram(epg);
  const upcoming = getUpcomingPrograms(epg, 2);
  const [imgError, setImgError] = useState(false);

  const relevantPrograms = useMemo(() => {
    const nowIdx = epg.programs.findIndex(p => p.isLive);
    if (nowIdx === -1) return epg.programs.slice(0, 8);
    const start = Math.max(0, nowIdx - 1);
    return epg.programs.slice(start, start + 8);
  }, [epg.programs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
      className="glass rounded-2xl overflow-hidden gradient-border hover:glow-sm transition-all duration-300"
    >
      <div className="flex items-center gap-3 p-3.5 cursor-pointer" onClick={() => onSelect(channel)}>
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-muted/50 flex-shrink-0 ring-1 ring-border/20">
          {!imgError && channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-sm font-bold text-muted-foreground">
              {channel.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground truncate">{channel.name}</span>
            {currentProgram && (
              <Radio className="w-3 h-3 text-primary flex-shrink-0 animate-pulse-glow" />
            )}
          </div>
          {currentProgram && (
            <div className="mt-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground/70 truncate">{currentProgram.title}</span>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                  {formatTime(currentProgram.endTime)} gacha
                </span>
              </div>
              <div className="w-full h-1 bg-muted/60 rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, hsl(262 83% 58%), hsl(330 80% 60%))' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${currentProgram.progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
          {!currentProgram && (
            <span className="text-xs text-muted-foreground">Dastur ma'lumoti yo'q</span>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground flex-shrink-0"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 pt-1 border-t border-border/30">
              <div className="space-y-0.5">
                {relevantPrograms.map(program => (
                  <ProgramRow key={program.id} program={program} />
                ))}
              </div>
              {upcoming.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-border/20">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Keyingi</span>
                  {upcoming.map(p => (
                    <ProgramRow key={p.id} program={p} compact />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const EPGSection: React.FC<Props> = ({ channels, epgData, onSelectChannel }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const epgMap = useMemo(() => {
    const map = new Map<string, ChannelEPG>();
    epgData.forEach(e => map.set(e.channelId, e));
    return map;
  }, [epgData]);

  const sortedChannels = useMemo(() => {
    return [...channels].sort((a, b) => {
      const aLive = epgMap.get(a.id)?.programs.some(p => p.isLive) ? 1 : 0;
      const bLive = epgMap.get(b.id)?.programs.some(p => p.isLive) ? 1 : 0;
      return bLive - aLive;
    });
  }, [channels, epgMap]);

  const displayChannels = showAll ? sortedChannels : sortedChannels.slice(0, 10);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-base font-display font-extrabold text-foreground">Dastur jadvali</h2>
        <span className="text-xs text-muted-foreground font-medium">— Bugun</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayChannels.map(channel => {
          const epg = epgMap.get(channel.id);
          if (!epg) return null;
          return (
            <ChannelEPGRow
              key={channel.id}
              channel={channel}
              epg={epg}
              onSelect={onSelectChannel}
              isExpanded={expandedId === channel.id}
              onToggle={() => setExpandedId(prev => prev === channel.id ? null : channel.id)}
            />
          );
        })}
      </div>

      {sortedChannels.length > 10 && (
        <motion.div className="flex justify-center mt-5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border/30 text-sm font-semibold text-secondary-foreground hover:text-foreground transition-all duration-300"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Kamroq ko'rsatish
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                Barcha kanallar jadvali ({sortedChannels.length})
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </motion.section>
  );
};
