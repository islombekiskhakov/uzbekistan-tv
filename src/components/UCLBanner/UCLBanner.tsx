import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useUCLMatches } from '@/hooks/useUCLMatches';
import { MatchCard } from './MatchCard';
import type { Channel } from '@/lib/parser';
import footballBg from '@/assets/football-banner-bg.jpg';

interface Props {
  channels: Channel[];
  onSelect: (channel: Channel) => void;
  onScrollToSport: () => void;
}

export const UCLBanner: React.FC<Props> = ({ channels, onSelect, onScrollToSport }) => {
  const { matches, loading, hasLive, lastUpdated } = useUCLMatches();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
    slidesToScroll: 1,
    containScroll: false,
  });

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  // Auto-scroll every 5 seconds
  React.useEffect(() => {
    if (!emblaApi || matches.length <= 1) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi, matches.length]);

  const handleWatch = useCallback(() => {
    onScrollToSport();
  }, [onScrollToSport]);

  if (loading || matches.length === 0) return null;

  const displayMatches = matches;

  return (
    <motion.section
      id="jonli-oyinlar"
      aria-label="Futbol jonli natijalar va kelgusi o'yinlar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-2xl mx-4 md:mx-8"
    >
      {/* Stadium background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${footballBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent_60%)]" />

      {/* Noise texture */}
      <div className="absolute inset-0 noise opacity-[0.03]" />

      <div className="relative z-10 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/40" />
          <div className="flex items-center gap-2">
            <span className="text-lg">⚽</span>
            <h2 className="text-white/90 font-bold text-sm md:text-base tracking-[0.15em] uppercase">
              {hasLive ? 'Jonli o\'yinlar' : 'Futbol'}
            </h2>
          </div>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/40" />
        </div>

        {/* Carousel with nav arrows */}
        <div className="relative group/carousel">
          {/* Prev arrow */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/80 transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="overflow-hidden px-2" ref={emblaRef}>
            <div className="flex">
              {displayMatches.map((match, i) => (
                <div
                  key={match.id}
                  className="flex-[0_0_88%] md:flex-[0_0_48%] lg:flex-[0_0_38%] min-w-0 px-2"
                >
                  <MatchCard match={match} onWatch={handleWatch} />
                </div>
              ))}
            </div>
          </div>

          {/* Next arrow */}
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/80 transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dots + last updated */}
        <div className="flex flex-col items-center gap-2 mt-4">
          {displayMatches.length > 1 && (
            <div className="flex justify-center gap-1.5">
              {displayMatches.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === selectedIndex
                      ? 'bg-white/60 w-5'
                      : 'bg-white/15 w-1.5 hover:bg-white/25'
                  }`}
                />
              ))}
            </div>
          )}
          {lastUpdated && (
            <p className="text-[10px] text-white/25 tracking-wide">
              Yangilangan: {lastUpdated.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
};
