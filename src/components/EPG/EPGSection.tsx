import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Calendar, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import type { Channel } from '@/lib/parser';
import { ChannelEPG, getCurrentProgram, getUpcomingPrograms, formatTime, Program } from '@/lib/epg';

interface Props {
  channels: Channel[];
  epgData: ChannelEPG[];
  onSelectChannel: (channel: Channel) => void;
}

const ProgramRow: React.FC<{ program: Program }> = ({ program }) => {
  const isPast = program.progress === 100 && !program.isLive;
  return (
    <div className={`flex items-center gap-3 py-1 ${isPast ? 'opacity-25' : ''}`}>
      <span className={`text-[11px] font-mono flex-shrink-0 ${program.isLive ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
        {formatTime(program.startTime)}
      </span>
      {program.isLive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow flex-shrink-0" />}
      <span className={`text-xs truncate ${program.isLive ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
        {program.title}
      </span>
      {program.isLive && (
        <span className="ml-auto text-[9px] text-primary font-bold flex-shrink-0">{program.progress}%</span>
      )}
    </div>
  );
};

const EPGRow: React.FC<{
  channel: Channel;
  epg: ChannelEPG;
  onSelect: (c: Channel) => void;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ channel, epg, onSelect, isExpanded, onToggle }) => {
  const currentProgram = getCurrentProgram(epg);
  const [imgError, setImgError] = useState(false);

  const relevantPrograms = useMemo(() => {
    const idx = epg.programs.findIndex(p => p.isLive);
    if (idx === -1) return epg.programs.slice(0, 6);
    return epg.programs.slice(Math.max(0, idx - 1), Math.max(0, idx - 1) + 6);
  }, [epg.programs]);

  return (
    <div className="bg-card/50 rounded-xl border border-border/20 hover:border-border/40 transition-colors overflow-hidden">
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => onSelect(channel)}>
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
          {!imgError && channel.logo ? (
            <img src={channel.logo} alt="" className="w-full h-full object-cover" loading="lazy" onError={() => setImgError(true)} />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-xs font-bold text-muted-foreground">{channel.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground truncate">{channel.name}</span>
            {currentProgram && <Radio className="w-2.5 h-2.5 text-primary flex-shrink-0" />}
          </div>
          {currentProgram && (
            <>
              <p className="text-[11px] text-muted-foreground truncate">{currentProgram.title} · {formatTime(currentProgram.endTime)} gacha</p>
              <div className="w-full h-0.5 bg-border/40 rounded-full mt-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentProgram.progress}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors flex-shrink-0"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-border/20 pt-2 space-y-0">
              {relevantPrograms.map(p => <ProgramRow key={p.id} program={p} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const EPGSection: React.FC<Props> = ({ channels, epgData, onSelectChannel }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const epgMap = useMemo(() => new Map(epgData.map(e => [e.channelId, e])), [epgData]);

  const sortedChannels = useMemo(() =>
    [...channels].sort((a, b) => {
      const aL = epgMap.get(a.id)?.programs.some(p => p.isLive) ? 1 : 0;
      const bL = epgMap.get(b.id)?.programs.some(p => p.isLive) ? 1 : 0;
      return bL - aL;
    }), [channels, epgMap]);

  const display = showAll ? sortedChannels : sortedChannels.slice(0, 10);

  return (
    <div className="px-4 md:px-8 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-primary" />
        <h2 className="text-sm md:text-base font-bold text-foreground">Dastur jadvali</h2>
        <span className="text-xs text-muted-foreground">— Bugun</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {display.map(ch => {
          const epg = epgMap.get(ch.id);
          if (!epg) return null;
          return (
            <EPGRow
              key={ch.id}
              channel={ch}
              epg={epg}
              onSelect={onSelectChannel}
              isExpanded={expandedId === ch.id}
              onToggle={() => setExpandedId(prev => prev === ch.id ? null : ch.id)}
            />
          );
        })}
      </div>
      {sortedChannels.length > 10 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-secondary/80 hover:bg-secondary text-xs font-semibold text-secondary-foreground hover:text-foreground transition-colors"
          >
            {showAll ? <><ChevronUp className="w-3.5 h-3.5" /> Kamroq</> : <><ChevronRight className="w-3.5 h-3.5" /> Barchasi ({sortedChannels.length})</>}
          </button>
        </div>
      )}
    </div>
  );
};
