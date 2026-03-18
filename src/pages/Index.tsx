import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Tv, Film, Newspaper, Baby, Trophy, Music, Sparkles, GraduationCap, FlaskConical } from 'lucide-react';
import { useChannels } from '@/hooks/useChannels';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { VideoPlayer } from '@/components/Player/VideoPlayer';
import { ChannelGrid } from '@/components/ChannelGrid/ChannelGrid';
import { ChannelRow } from '@/components/ChannelGrid/ChannelRow';
import { CategoryNav } from '@/components/Sidebar/CategoryNav';
import { SearchBar } from '@/components/SearchBar';
import { ContinueWatching } from '@/components/ContinueWatching';
import { EPGSection } from '@/components/EPG/EPGSection';
import { HeroBanner } from '@/components/HeroBanner';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { generateEPG } from '@/lib/epg';
import type { Channel } from '@/lib/parser';

interface WatchHistoryEntry {
  channelId: string;
  timestamp: number;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Milliy': <Tv className="w-4 h-4 text-primary" />,
  'Kino': <Film className="w-4 h-4 text-primary" />,
  'Yangiliklar': <Newspaper className="w-4 h-4 text-primary" />,
  'Bolalar uchun': <Baby className="w-4 h-4 text-primary" />,
  'Sport': <Trophy className="w-4 h-4 text-primary" />,
  'Musiqiy': <Music className="w-4 h-4 text-primary" />,
  "Ko'ngil Ochar": <Sparkles className="w-4 h-4 text-primary" />,
  "Ta'lim": <GraduationCap className="w-4 h-4 text-primary" />,
  "Ta'lim va ilm fan": <FlaskConical className="w-4 h-4 text-primary" />,
};

const Index: React.FC = () => {
  const { channels, categories, categoryMap, loading } = useChannels();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [history, setHistory] = useLocalStorage<WatchHistoryEntry[]>('uztv-history', []);
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>('uztv-favorites', []);
  const [showFavorites, setShowFavorites] = useState(false);

  const favoritesSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const epgData = useMemo(() => generateEPG(channels), [channels]);

  const handleToggleFavorite = useCallback((channelId: string) => {
    setFavoriteIds(prev =>
      prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId]
    );
  }, [setFavoriteIds]);

  const channelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(cat => { counts[cat] = categoryMap[cat]?.length || 0; });
    return counts;
  }, [categories, categoryMap]);

  const isFiltering = !!(search.trim() || activeCategory || showFavorites);

  const filteredChannels = useMemo(() => {
    let result = channels;
    if (showFavorites) {
      result = result.filter(c => favoritesSet.has(c.id));
    } else if (activeCategory) {
      const ids = new Set(categoryMap[activeCategory] || []);
      result = result.filter(c => ids.has(c.id));
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }
    return result;
  }, [channels, activeCategory, categoryMap, search, showFavorites, favoritesSet]);

  const handleSelect = useCallback((channel: Channel) => {
    setActiveChannel(channel);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setHistory(prev => {
      const filtered = prev.filter(h => h.channelId !== channel.id);
      return [{ channelId: channel.id, timestamp: Date.now() }, ...filtered].slice(0, 5);
    });
  }, [setHistory]);

  const handleClearHistory = useCallback(() => setHistory([]), [setHistory]);
  const handleToggleFavoritesFilter = useCallback(() => {
    setShowFavorites(prev => !prev);
    setActiveCategory(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Yuklanmoqda...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background noise">
      {/* Sticky Header */}
      <Header>
        <div className="flex-1" />
        <SearchBar value={search} onChange={setSearch} />
      </Header>

      {/* Player */}
      <AnimatePresence mode="wait">
        {activeChannel && (
          <motion.div
            key={activeChannel.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-background"
          >
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-4">
              <button
                onClick={() => setActiveChannel(null)}
                className="flex items-center gap-2 mb-3 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Orqaga
              </button>
            </div>
            <div className="max-w-5xl mx-auto px-4 md:px-8 pb-6">
              <VideoPlayer
                url={activeChannel.url}
                channelName={activeChannel.name}
                channelLogo={activeChannel.logo}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto pt-5 space-y-6">
        {/* Continue Watching */}
        {!activeChannel && (
          <ContinueWatching
            history={history}
            channels={channels}
            onSelect={handleSelect}
            onClear={handleClearHistory}
          />
        )}

        {/* Hero Banner — only when not filtering */}
        {!activeChannel && !isFiltering && (
          <HeroBanner channels={channels} epgData={epgData} onSelect={handleSelect} />
        )}

        {/* Category pills */}
        <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          channelCounts={channelCounts}
          favoritesCount={favoriteIds.length}
          showFavorites={showFavorites}
          onToggleFavorites={handleToggleFavoritesFilter}
        />

        {/* Content */}
        {isFiltering ? (
          /* Grid when filtering/searching */
          <ChannelGrid
            channels={filteredChannels}
            onSelect={handleSelect}
            favorites={favoritesSet}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          /* Horizontal rows by category */
          <div className="space-y-8">
            {categories.slice(0, 6).map(cat => {
              const catChannelIds = categoryMap[cat] || [];
              const catChannels = channels.filter(c => catChannelIds.includes(c.id));
              return (
                <ChannelRow
                  key={cat}
                  title={cat}
                  icon={CATEGORY_ICONS[cat] || <Tv className="w-4 h-4 text-primary" />}
                  channels={catChannels}
                  onSelect={handleSelect}
                  favorites={favoritesSet}
                  onToggleFavorite={handleToggleFavorite}
                />
              );
            })}
          </div>
        )}

        {/* EPG */}
        {!activeChannel && !isFiltering && (
          <EPGSection
            channels={channels}
            epgData={epgData}
            onSelectChannel={handleSelect}
          />
        )}

        <Footer />
      </div>
    </div>
  );
};

export default Index;
