import type { Channel } from './parser';

export interface Program {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  category: string;
  isLive: boolean;
  progress: number; // 0-100
}

export interface ChannelEPG {
  channelId: string;
  programs: Program[];
}

// Realistic Uzbek/Russian TV program names by channel type
const PROGRAM_POOLS: Record<string, string[]> = {
  news: [
    'Yangiliklar', 'Axborot', 'Kundalik yangiliklar', 'Maxsus reportaj',
    'Hafta yangiliklari', 'Dunyo yangiliklari', 'Iqtisodiy tahlil',
    'Sport yangiliklari', 'Ob-havo', 'Siyosiy sharh',
    'Вести', 'Новости', 'Время', 'Итоги недели',
  ],
  entertainment: [
    'Oila davrasida', 'Kulgili lahzalar', 'Talant shou', 'Musiqa olami',
    'Konsert dasturi', 'Ertalabki dastur', 'Kechki shou', 'Sayohat',
    'Biz birga', 'Yurak sirlarini', 'Sevgi istirobi',
    'Развлекательное шоу', 'Вечерний эфир', 'Утреннее шоу',
  ],
  movie: [
    'Badiiy film', 'Kino premyera', 'Serial', 'Hind filmi',
    'Turk seriali', 'Detektiv', 'Komediya', 'Drama',
    'Fantastika', 'Jangari film', 'Oilaviy film',
    'Художественный фильм', 'Кинопремьера', 'Мелодрама', 'Боевик',
  ],
  kids: [
    'Multfilm', 'Bolalar dunyosi', 'Ertaklar olami', 'Bilimdon',
    'Kichkintoylar uchun', 'Qiziqarli matematika', 'Tabiat dunyosi',
    'Мультфильм', 'Детский мир', 'Сказки',
  ],
  sport: [
    'Futbol', 'Jonli translatsiya', 'Sport tahlili', 'Boks',
    'Tennis', 'Basketbol', 'Voleybol', 'MMA jang',
    'Futbol sharhi', 'Sport yangiliklari', 'Olamsport',
    'Футбол', 'Спортивный обзор', 'Хоккей',
  ],
  music: [
    'Musiqa kliplari', 'Top 10', 'Konsert', 'Jonli ijro',
    'Xalq qo\'shiqlari', 'Pop musiqa', 'Mumtoz musiqa',
    'Музыкальная пауза', 'Концерт', 'Хит-парад',
  ],
  education: [
    'Hujjatli film', 'Ilm-fan', 'Tarix sahifalari', 'Kashfiyotlar',
    'Tabiat haqida', 'Texnologiyalar', 'Salomatlik', 'Madaniyat',
    'Документальный фильм', 'Наука', 'Путешествия', 'Природа',
  ],
};

function getPoolForChannel(channelName: string, categories: string[]): string[] {
  const name = channelName.toLowerCase();
  const cats = categories.map(c => c.toLowerCase()).join(' ');

  if (cats.includes('sport') || name.includes('sport') || name.includes('futbol') || name.includes('setanta') || name.includes('mma')) {
    return PROGRAM_POOLS.sport;
  }
  if (cats.includes('kino') || name.includes('kino') || name.includes('cinema') || name.includes('film') || name.includes('hollywood') || name.includes('bollywood')) {
    return PROGRAM_POOLS.movie;
  }
  if (cats.includes('bolalar') || name.includes('bolaj') || name.includes('kid') || name.includes('мульт') || name.includes('карусель') || name.includes('детск')) {
    return PROGRAM_POOLS.kids;
  }
  if (cats.includes('musiq') || name.includes('music') || name.includes('musiqa') || name.includes('муз') || name.includes('navo')) {
    return PROGRAM_POOLS.music;
  }
  if (cats.includes('yangilik') || name.includes('24') || name.includes('news') || name.includes('cnn') || name.includes('bbc') || name.includes('россия')) {
    return PROGRAM_POOLS.news;
  }
  if (cats.includes("ta'lim") || name.includes('discovery') || name.includes('national') || name.includes('history') || name.includes('наук')) {
    return PROGRAM_POOLS.education;
  }
  return PROGRAM_POOLS.entertainment;
}

// Seeded random for consistency within a day
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateEPG(channels: Channel[]): ChannelEPG[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  return channels.map((channel) => {
    const rand = seededRandom(daySeed + channel.id.length * 31 + channel.id.charCodeAt(0) * 17);
    const pool = getPoolForChannel(channel.name, channel.categories);
    const programs: Program[] = [];

    // Generate programs from 6 AM to midnight
    let currentTime = new Date(today);
    currentTime.setHours(6, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    let programIndex = 0;
    while (currentTime < endOfDay) {
      // Duration: 30, 45, 60, 90, or 120 minutes
      const durations = [30, 45, 60, 60, 90, 120];
      const duration = durations[Math.floor(rand() * durations.length)];
      const startTime = new Date(currentTime);
      const endTime = new Date(currentTime.getTime() + duration * 60000);

      const title = pool[Math.floor(rand() * pool.length)];
      const isLive = now >= startTime && now < endTime;
      let progress = 0;
      if (isLive) {
        progress = Math.round(((now.getTime() - startTime.getTime()) / (endTime.getTime() - startTime.getTime())) * 100);
      } else if (now > endTime) {
        progress = 100;
      }

      programs.push({
        id: `${channel.id}-${programIndex}`,
        title,
        startTime,
        endTime,
        category: channel.categories[0] || 'General',
        isLive,
        progress,
      });

      currentTime = endTime;
      programIndex++;
    }

    return { channelId: channel.id, programs };
  });
}

export function getCurrentProgram(epg: ChannelEPG): Program | undefined {
  return epg.programs.find(p => p.isLive);
}

export function getUpcomingPrograms(epg: ChannelEPG, count: number = 3): Program[] {
  const now = new Date();
  return epg.programs.filter(p => p.startTime > now).slice(0, count);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false });
}
