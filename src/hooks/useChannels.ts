import { useState, useEffect } from 'react';
import { parseChannels, Channel, CategoryMap } from '@/lib/parser';

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryMap, setCategoryMap] = useState<CategoryMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/channels_list.txt')
      .then(r => r.text())
      .then(text => {
        const result = parseChannels(text);
        setChannels(result.channels);
        setCategories(result.categories);
        setCategoryMap(result.categoryMap);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { channels, categories, categoryMap, loading };
}
