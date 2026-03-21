import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import type { UCLMatch } from '@/hooks/useUCLMatches';

interface Props {
  match: UCLMatch;
  onWatch: () => void;
}

const isLive = (status: string) => ['IN_PLAY', 'LIVE', 'PAUSED'].includes(status);

function formatMatchDate(utcDate: string): string {
  const date = new Date(utcDate);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Bugun, ${time}`;
  if (isTomorrow) return `Ertaga, ${time}`;

  return date.toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const MatchCard: React.FC<Props> = ({ match, onWatch }) => {
  const live = isLive(match.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8"
    >
      {/* Live pulse background */}
      {live && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
      )}

      {/* Status badge */}
      <div className="flex justify-center mb-5">
        {live ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Jonli
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/60 text-xs font-medium">
            <Clock className="w-3 h-3" />
            {formatMatchDate(match.utcDate)}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-4 md:gap-8">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 p-2 flex items-center justify-center">
            <img
              src={match.homeTeam.crest}
              alt={match.homeTeam.shortName}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
          <span className="text-white font-semibold text-sm md:text-base text-center truncate w-full">
            {match.homeTeam.shortName}
          </span>
        </div>

        {/* Score / VS */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          {live ? (
            <div className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl font-black text-white tabular-nums">
                {match.score.fullTime.home ?? 0}
              </span>
              <span className="text-lg text-white/30 font-light">:</span>
              <span className="text-3xl md:text-4xl font-black text-white tabular-nums">
                {match.score.fullTime.away ?? 0}
              </span>
            </div>
          ) : (
            <span className="text-2xl md:text-3xl font-black text-white/20">VS</span>
          )}
          <span className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
            {match.stage?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 p-2 flex items-center justify-center">
            <img
              src={match.awayTeam.crest}
              alt={match.awayTeam.shortName}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
          <span className="text-white font-semibold text-sm md:text-base text-center truncate w-full">
            {match.awayTeam.shortName}
          </span>
        </div>
      </div>

      {/* Watch Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={onWatch}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95"
        >
          <Zap className="w-4 h-4" />
          Tomosha qilish
        </button>
      </div>
    </motion.div>
  );
};
