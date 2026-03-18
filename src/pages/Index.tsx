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

    if (activeCategory) {
      const ids = new Set(categoryMap[activeCategory] || []);
      result = result.filter(c => ids.has(c.id));
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }

    return result;
  }, [channels, activeCategory, categoryMap, search]);

  const handleSelect = useCallback((channel: Channel) => {
    setActiveChannel(channel);
    setHistory(prev => {
      const filtered = prev.filter(h => h.channelId !== channel.id);
      return [{ channelId: channel.id, timestamp: Date.now() }, ...filtered].slice(0, 5);
    });
  }, [setHistory]);

  const handleClearHistory = useCallback(() => setHistory([]), [setHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background noise">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-md">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Kanallar yuklanmoqda...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background noise">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4 md:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Header />
          <div className="sm:ml-auto w-full sm:w-auto">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>

        {/* Player Section */}
        <AnimatePresence mode="wait">
          {activeChannel && (
            <motion.div
              key={activeChannel.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <button
                onClick={() => setActiveChannel(null)}
                className="flex items-center gap-2 mb-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kanallar ro'yxatiga qaytish
              </button>
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

        {/* Continue Watching */}
        {!activeChannel && (
          <ContinueWatching
            history={history}
            channels={channels}
            onSelect={handleSelect}
            onClear={handleClearHistory}
          />
        )}

        {/* EPG Section - only when no channel is playing and no search/filter active */}
        {!activeChannel && !search && !activeCategory && (
          <EPGSection
            channels={channels}
            epgData={epgData}
            onSelectChannel={handleSelect}
          />
        )}

        {/* Categories */}
        <div className="mb-6">
          <CategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            channelCounts={channelCounts}
          />
        </div>

        {/* Channel Grid */}
        <ChannelGrid channels={filteredChannels} onSelect={handleSelect} />

        <Footer />
      </div>
    </div>
  );
};

export default Index;
