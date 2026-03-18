import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useChannels } from '@/hooks/useChannels';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { VideoPlayer } from '@/components/Player/VideoPlayer';
import { ChannelGrid } from '@/components/ChannelGrid/ChannelGrid';
import { CategoryNav } from '@/components/Sidebar/CategoryNav';
import { SearchBar } from '@/components/SearchBar';
import { ContinueWatching } from '@/components/ContinueWatching';
import { EPGSection } from '@/components/EPG/EPGSection';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { generateEPG } from '@/lib/epg';
import type { Channel } from '@/lib/parser';

interface WatchHistoryEntry {
  channelId: string;
  timestamp: number;
}

const Index: React.FC = () => {
  const { channels, categories, categoryMap, loading } = useChannels();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [history, setHistory] = useLocalStorage<WatchHistoryEntry[]>('uztv-history', []);
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>('uztv-favorites', []);
  const [showFavorites, setShowFavorites] = useState(false);

  const favoritesSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const handleToggleFavorite = useCallback((channelId: string) => {
    setFavoriteIds(prev =>
      prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId]
    );
  }, [setFavoriteIds]);

  const channelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      counts[cat] = categoryMap[cat]?.length || 0;
    });
    return counts;
  }, [categories, categoryMap]);

  const epgData = useMemo(() => generateEPG(channels), [channels]);

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
      <div className="flex items-center justify-center min-h-screen bg-background noise">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center glow-lg">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground font-semibold tracking-wide">Kanallar yuklanmoqda...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background noise">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent/[0.03] blur-[120px]" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-4 md:px-6 py-5 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <Header />
          <div className="sm:ml-auto w-full sm:w-auto">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeChannel && (
            <motion.div
              key={activeChannel.id}
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <motion.button
                whileHover={{ x: -4 }}
                onClick={() => setActiveChannel(null)}
                className="flex items-center gap-2 mb-4 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Kanallar ro'yxatiga qaytish
              </motion.button>
              <div className="max-w-4xl mx-auto">
                <VideoPlayer
                  url={activeChannel.url}
                  channelName={activeChannel.name}
                  channelLogo={activeChannel.logo}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!activeChannel && (
          <ContinueWatching
            history={history}
            channels={channels}
            onSelect={handleSelect}
            onClear={handleClearHistory}
          />
        )}

        <div className="mb-6">
          <CategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            channelCounts={channelCounts}
            favoritesCount={favoriteIds.length}
            showFavorites={showFavorites}
            onToggleFavorites={handleToggleFavoritesFilter}
          />
        </div>

        <ChannelGrid
          channels={filteredChannels}
          onSelect={handleSelect}
          favorites={favoritesSet}
          onToggleFavorite={handleToggleFavorite}
        />

        {!activeChannel && !search && !activeCategory && !showFavorites && (
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
