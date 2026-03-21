import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useUCLMatches } from '@/hooks/useUCLMatches';
import { MatchCard } from './MatchCard';
import type { Channel } from '@/lib/parser';

interface Props {
  channels: Channel[];
  onSelect: (channel: Channel) => void;
}

export const UCLBanner: React.FC<Props> = ({ channels, onSelect }) => {
  const { matches, loading } = useUCLMatches();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  // Auto-scroll every 6 seconds
  React.useEffect(() => {
    if (!emblaApi || matches.length <= 1) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => clearInterval(interval);
  }, [emblaApi, matches.length]);

  const handleWatch = useCallback(() => {
    const setanta = channels.find(c =>
      c.name.toLowerCase().includes('setanta')
    );
    if (setanta) onSelect(setanta);
  }, [channels, onSelect]);

  if (loading || matches.length === 0) return null;

  const displayMatches = matches.slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl mx-4 md:mx-8"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d2818] to-[#0a1628]" />

      {/* Football pitch pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pitch" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <rect width="60" height="60" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="30" cy="30" r="10" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pitch)" />
      </svg>

      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 py-8 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-white font-bold text-lg md:text-xl tracking-tight">
            UEFA Champions League
          </h2>
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {displayMatches.map((match) => (
              <div
                key={match.id}
                className="flex-[0_0_85%] md:flex-[0_0_50%] lg:flex-[0_0_40%] min-w-0 px-2 md:px-3"
              >
                <MatchCard match={match} onWatch={handleWatch} />
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {displayMatches.length > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {displayMatches.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === selectedIndex
                    ? 'bg-white w-6'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};
