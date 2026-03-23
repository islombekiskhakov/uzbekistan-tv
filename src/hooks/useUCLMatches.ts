import { useState, useEffect, useRef } from 'react';

export interface UCLTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface UCLMatch {
  id: number;
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' | 'LIVE';
  utcDate: string;
  matchday: number;
  stage: string;
  leagueName: string;
  leagueLogo: string;
  homeTeam: UCLTeam;
  awayTeam: UCLTeam;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

const API_KEY = 'c5798e9b8b89728e719f4deeb37a5d99';
const API_HOST = 'v3.football.api-sports.io';

// EPL(39), UCL(2), La Liga(140), Uzbekistan Super League(373), Serie A(135), Bundesliga(78)
const SELECTED_LEAGUES = [39, 2, 140, 373, 135, 78];
const LEAGUE_IDS_STR = SELECTED_LEAGUES.join('-');

function mapStatus(shortStatus: string): UCLMatch['status'] {
  const map: Record<string, UCLMatch['status']> = {
    'TBD': 'SCHEDULED', 'NS': 'SCHEDULED',
    '1H': 'IN_PLAY', 'HT': 'PAUSED', '2H': 'IN_PLAY',
    'ET': 'IN_PLAY', 'BT': 'PAUSED', 'P': 'IN_PLAY',
    'SUSP': 'PAUSED', 'INT': 'PAUSED',
    'FT': 'FINISHED', 'AET': 'FINISHED', 'PEN': 'FINISHED',
    'PST': 'POSTPONED', 'CANC': 'CANCELLED', 'ABD': 'CANCELLED',
    'AWD': 'FINISHED', 'WO': 'FINISHED', 'LIVE': 'LIVE',
  };
  return map[shortStatus] || 'SCHEDULED';
}

function shortenName(name: string): string {
  if (name.length <= 14) return name;
  const shorts: Record<string, string> = {
    'Manchester United': 'Man United',
    'Manchester City': 'Man City',
    'Borussia Dortmund': 'Dortmund',
    'Paris Saint Germain': 'PSG',
    'Atletico Madrid': 'Atletico',
    'Bayern Munich': 'Bayern',
    'Tottenham Hotspur': 'Tottenham',
    'Wolverhampton Wanderers': 'Wolves',
    'Newcastle United': 'Newcastle',
    'West Ham United': 'West Ham',
    'Nottingham Forest': "Nott'm Forest",
    'Sheffield United': 'Sheffield Utd',
    'Brighton And Hove Albion': 'Brighton',
  };
  if (shorts[name]) return shorts[name];
  const words = name.split(' ');
  if (words.length > 2) return words.slice(0, 2).join(' ');
  return name;
}

function mapFixture(fixture: any): UCLMatch {
  return {
    id: fixture.fixture.id,
    status: mapStatus(fixture.fixture.status.short),
    utcDate: fixture.fixture.date,
    matchday: fixture.league.round ? parseInt(fixture.league.round.replace(/\D/g, '')) || 0 : 0,
    stage: fixture.league.round || '',
    leagueName: fixture.league.name || '',
    leagueLogo: fixture.league.logo || '',
    homeTeam: {
      id: fixture.teams.home.id,
      name: fixture.teams.home.name,
      shortName: shortenName(fixture.teams.home.name),
      tla: fixture.teams.home.name.substring(0, 3).toUpperCase(),
      crest: fixture.teams.home.logo,
    },
    awayTeam: {
      id: fixture.teams.away.id,
      name: fixture.teams.away.name,
      shortName: shortenName(fixture.teams.away.name),
      tla: fixture.teams.away.name.substring(0, 3).toUpperCase(),
      crest: fixture.teams.away.logo,
    },
    score: {
      fullTime: { home: fixture.goals.home, away: fixture.goals.away },
      halfTime: { home: fixture.score.halftime.home, away: fixture.score.halftime.away },
    },
  };
}

const emptyScore = { fullTime: { home: null, away: null }, halfTime: { home: null, away: null } };

const FALLBACK_MATCHES: UCLMatch[] = [
  {
    id: 1, status: 'SCHEDULED', utcDate: '2026-04-08T19:00:00Z', matchday: 1, stage: 'Quarter-finals',
    leagueName: 'UEFA Champions League', leagueLogo: 'https://media.api-sports.io/football/leagues/2.png',
    homeTeam: { id: 541, name: 'Real Madrid', shortName: 'Real Madrid', tla: 'RMA', crest: 'https://media.api-sports.io/football/teams/541.png' },
    awayTeam: { id: 157, name: 'Bayern Munich', shortName: 'Bayern', tla: 'BAY', crest: 'https://media.api-sports.io/football/teams/157.png' },
    score: emptyScore,
  },
  {
    id: 2, status: 'SCHEDULED', utcDate: '2026-04-08T19:00:00Z', matchday: 1, stage: 'Quarter-finals',
    leagueName: 'UEFA Champions League', leagueLogo: 'https://media.api-sports.io/football/leagues/2.png',
    homeTeam: { id: 529, name: 'Barcelona', shortName: 'Barcelona', tla: 'BAR', crest: 'https://media.api-sports.io/football/teams/529.png' },
    awayTeam: { id: 165, name: 'Borussia Dortmund', shortName: 'Dortmund', tla: 'BVB', crest: 'https://media.api-sports.io/football/teams/165.png' },
    score: emptyScore,
  },
  {
    id: 3, status: 'SCHEDULED', utcDate: '2026-04-09T19:00:00Z', matchday: 1, stage: 'Quarter-finals',
    leagueName: 'UEFA Champions League', leagueLogo: 'https://media.api-sports.io/football/leagues/2.png',
    homeTeam: { id: 42, name: 'Arsenal', shortName: 'Arsenal', tla: 'ARS', crest: 'https://media.api-sports.io/football/teams/42.png' },
    awayTeam: { id: 85, name: 'Paris Saint Germain', shortName: 'PSG', tla: 'PSG', crest: 'https://media.api-sports.io/football/teams/85.png' },
    score: emptyScore,
  },
  {
    id: 4, status: 'SCHEDULED', utcDate: '2026-04-09T19:00:00Z', matchday: 1, stage: 'Quarter-finals',
    leagueName: 'UEFA Champions League', leagueLogo: 'https://media.api-sports.io/football/leagues/2.png',
    homeTeam: { id: 505, name: 'Inter Milan', shortName: 'Inter', tla: 'INT', crest: 'https://media.api-sports.io/football/teams/505.png' },
    awayTeam: { id: 50, name: 'Manchester City', shortName: 'Man City', tla: 'MCI', crest: 'https://media.api-sports.io/football/teams/50.png' },
    score: emptyScore,
  },
];

// Cache upcoming matches in localStorage to save API calls across page reloads
const UPCOMING_CACHE_KEY = 'ucl_upcoming_cache';
const UPCOMING_CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

function getCachedUpcoming(): UCLMatch[] | null {
  try {
    const raw = localStorage.getItem(UPCOMING_CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > UPCOMING_CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function setCachedUpcoming(data: UCLMatch[]) {
  try {
    localStorage.setItem(UPCOMING_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch { /* ignore */ }
}

async function apiFetch(endpoint: string) {
  const res = await fetch(`https://${API_HOST}${endpoint}`, {
    headers: { 'x-apisports-key': API_KEY },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    console.warn('API-Football errors:', data.errors);
  }
  return data.response || [];
}

export function useUCLMatches() {
  const [matches, setMatches] = useState<UCLMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLive, setHasLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const upcomingFetchedRef = useRef(false);
  const upcomingMatchesRef = useRef<UCLMatch[]>([]);

  /** Check if current time is in active window (19:00–03:00 UZT / UTC+5) */
  const isActiveHour = () => {
    const now = new Date();
    const uzHour = (now.getUTCHours() + 5) % 24;
    return uzHour >= 19 || uzHour < 3;
  };

  /**
   * Fetch live matches — single request using league filter
   * Endpoint: /fixtures?live=39-2-140-373-135-78
   * Cost: 1 request
   */
  const fetchLive = async (): Promise<UCLMatch[]> => {
    try {
      const fixtures = await apiFetch(`/fixtures?live=${LEAGUE_IDS_STR}`);
      return fixtures.map(mapFixture);
    } catch (err) {
      console.warn('Live fixtures fetch failed:', err);
      return [];
    }
  };

  /**
   * Fetch upcoming matches — one request per league using `next` param
   * No season param needed! Works on free plan.
   * Endpoint: /fixtures?league=X&next=3
   * Cost: 6 requests (one per league), cached for 3 hours
   */
  const fetchUpcoming = async (): Promise<UCLMatch[]> => {
    // Check cache first
    const cached = getCachedUpcoming();
    if (cached) {
      console.log('Using cached upcoming matches');
      return cached;
    }

    const all: UCLMatch[] = [];
    // Fetch all leagues in parallel
    const results = await Promise.allSettled(
      SELECTED_LEAGUES.map(async (leagueId) => {
        const fixtures = await apiFetch(`/fixtures?league=${leagueId}&next=3`);
        return fixtures
          .filter((f: any) => {
            const st = f.fixture.status.short;
            return ['TBD', 'NS'].includes(st); // Only scheduled
          })
          .map(mapFixture);
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        all.push(...result.value);
      }
    }

    // Sort by date
    all.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
    const upcoming = all.slice(0, 15);

    // Cache for 3 hours
    if (upcoming.length > 0) {
      setCachedUpcoming(upcoming);
    }

    return upcoming;
  };

  /** Main fetch: combine live + upcoming */
  const fetchAll = async (liveOnly = false) => {
    try {
      const liveMatches = await fetchLive();

      let upcoming = upcomingMatchesRef.current;
      if (!liveOnly || upcoming.length === 0) {
        upcoming = await fetchUpcoming();
        upcomingMatchesRef.current = upcoming;
        upcomingFetchedRef.current = true;
      }

      // Deduplicate: live takes priority
      const liveIds = new Set(liveMatches.map(m => m.id));
      const combined = [
        ...liveMatches,
        ...upcoming.filter(m => !liveIds.has(m.id)),
      ];

      if (combined.length === 0) {
        throw new Error('No matches found');
      }

      // Sort: live first, then by date
      combined.sort((a, b) => {
        const liveStatuses = ['IN_PLAY', 'LIVE', 'PAUSED'];
        const aLive = liveStatuses.includes(a.status) ? 0 : 1;
        const bLive = liveStatuses.includes(b.status) ? 0 : 1;
        if (aLive !== bLive) return aLive - bLive;
        return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
      });

      const live = combined.some(m => ['IN_PLAY', 'LIVE', 'PAUSED'].includes(m.status));
      setMatches(combined.slice(0, 15));
      setHasLive(live);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.warn('API-Football fetch failed, using fallback:', err);
      setMatches(FALLBACK_MATCHES);
      setHasLive(false);
      setLastUpdated(new Date());
      setError('Using fallback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    /*
     * Budget: 100 requests/day
     * Active window: 19:00–03:00 UZT (8 hours)
     *
     * Upcoming: 6 requests (once, cached 3h in localStorage)
     * Live:     1 request per poll (every 6 min) × 80 polls = 80 requests
     * Total:    ~86 requests/day max
     */
    const LIVE_INTERVAL_MS = 6 * 60 * 1000; // 6 minutes

    // Initial fetch: always load once (live + upcoming)
    fetchAll(false);

    // Poll live matches during active hours only
    liveIntervalRef.current = setInterval(() => {
      if (isActiveHour()) {
        fetchAll(true); // live-only refresh (upcoming from cache/ref)
      }
    }, LIVE_INTERVAL_MS);

    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    };
  }, []);

  return { matches, loading, error, hasLive, lastUpdated };
}
