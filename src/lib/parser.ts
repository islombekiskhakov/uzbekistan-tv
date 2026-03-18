export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  categories: string[];
}

export interface CategoryMap {
  [category: string]: string[]; // channel ids
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[ʻ`']/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0400-\u04ff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function parseChannels(text: string): {
  channels: Channel[];
  categories: string[];
  categoryMap: CategoryMap;
} {
  const channelsByKey = new Map<string, Channel>();
  const categoryMap: CategoryMap = {};
  const categoryOrder: string[] = [];
  let currentCategory = "General";

  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Category line
    if (line.startsWith('Category:')) {
      currentCategory = line.substring('Category:'.length).trim();
      if (!categoryOrder.includes(currentCategory)) {
        categoryOrder.push(currentCategory);
      }
      if (!categoryMap[currentCategory]) {
        categoryMap[currentCategory] = [];
      }
      continue;
    }

    // Channel line: Name\tLogoURL\tStreamURL (tab-separated)
    // Handle multiple tabs and spaces
    const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
    if (parts.length < 3) continue;

    const name = parts[0].replace(/\+$/, '').trim();
    // Find the logo URL and stream URL
    let logo = '';
    let url = '';

    for (let j = 1; j < parts.length; j++) {
      const part = parts[j];
      if (part.startsWith('http')) {
        if (part.match(/\.(jpeg|jpg|png|gif|svg|webp)/i)) {
          logo = part;
        } else if (part.match(/\.m3u8/i)) {
          url = part;
        } else if (!logo && !url) {
          // Guess based on content
          if (part.includes('stream') || part.includes('tracks')) {
            url = part;
          } else {
            logo = part;
          }
        } else if (!url) {
          url = part;
        }
      }
    }

    if (!url || !name) continue;

    const key = slugify(name);
    if (!key) continue;

    if (!categoryMap[currentCategory]) {
      categoryMap[currentCategory] = [];
      if (!categoryOrder.includes(currentCategory)) {
        categoryOrder.push(currentCategory);
      }
    }

    if (channelsByKey.has(key)) {
      const existing = channelsByKey.get(key)!;
      if (!existing.categories.includes(currentCategory)) {
        existing.categories.push(currentCategory);
      }
      if (!categoryMap[currentCategory].includes(existing.id)) {
        categoryMap[currentCategory].push(existing.id);
      }
    } else {
      const id = key;
      const channel: Channel = { id, name, logo, url, categories: [currentCategory] };
      channelsByKey.set(key, channel);
      categoryMap[currentCategory].push(id);
    }
  }

  const channels = Array.from(channelsByKey.values());
  return { channels, categories: categoryOrder, categoryMap };
}
