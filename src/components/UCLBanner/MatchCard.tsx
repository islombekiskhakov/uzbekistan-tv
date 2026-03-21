import React from 'react';
import { motion } from 'framer-motion';
import { Play, Radio } from 'lucide-react';
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

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const time = `${hours}:${minutes}`;

  if (isToday) return `Bugun, ${time}`;
  if (isTomorrow) return `Ertaga, ${time}`;

  const day = date.getDate();
  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const month = monthNames[date.getMonth()];

  return `${day}-${month}, ${time}`;
}

export const MatchCard: React.FC<Props> = ({ match, onWatch }) => {
  const live = isLive(match.status);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-2xl">
        {live && (
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-red-500/40 via-orange-500/40 to-red-500/40 animate-pulse pointer-events-none" />
        )}

        <div className="relative p-5 md:p-7">
          {/* Top bar: league + status */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 min-w-0">
              {match.leagueLogo && (
                <img src={match.leagueLogo} alt="" className="w-4 h-4 object-contain shrink-0" />
              )}
              <span className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-medium truncate">
                {match.leagueName}
              </span>
            </div>
            {live ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider shrink-0">
                <Radio className="w-3 h-3 animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] text-white/50 text-[11px] font-medium shrink-0">
                {formatMatchDate(match.utcDate)}
              </span>
            )}
          </div>

          {/* Teams row */}
          <div className="flex items-center gap-3 md:gap-5">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/[0.06] p-1.5 flex items-center justify-center shrink-0 ring-1 ring-white/[0.05]">
                <img src={match.homeTeam.crest} alt={match.homeTeam.shortName} className="w-full h-full object-contain drop-shadow-lg" loading="lazy" />
              </div>
              <div className="min-w-0">
                <span className="text-white font-bold text-sm md:text-base block truncate">{match.homeTeam.shortName}</span>
                <span className="text-white/25 text-[10px] uppercase tracking-wider">{match.homeTeam.tla}</span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center">
              {live ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-black text-white tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                    {match.score.fullTime.home ?? 0}
                  </span>
                  <span className="text-white/20 text-xl font-thin">–</span>
                  <span className="text-3xl md:text-4xl font-black text-white tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                    {match.score.fullTime.away ?? 0}
                  </span>
                </div>
              ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <span className="text-xs font-bold text-white/20 uppercase">vs</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <span className="text-white font-bold text-sm md:text-base block truncate">{match.awayTeam.shortName}</span>
                <span className="text-white/25 text-[10px] uppercase tracking-wider">{match.awayTeam.tla}</span>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/[0.06] p-1.5 flex items-center justify-center shrink-0 ring-1 ring-white/[0.05]">
                <img src={match.awayTeam.crest} alt={match.awayTeam.shortName} className="w-full h-full object-contain drop-shadow-lg" loading="lazy" />
              </div>
            </div>
          </div>

          {/* Watch Button */}
          <div className="mt-5 flex justify-center">
            <button
              onClick={onWatch}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white/80 hover:text-white font-medium text-xs tracking-wide transition-all duration-300 border border-white/[0.06] hover:border-white/[0.12] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Tomosha qilish
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
