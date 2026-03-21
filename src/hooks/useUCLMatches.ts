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
  // Common shortenings
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
  // Fallback: first two words
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

export function useUCLMatches() {
  const [matches, setMatches] = useState<UCLMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLive, setHasLive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMatches = async () => {
    try {
      // Selected leagues: EPL(39), UCL(2), La Liga(140), Uzbekistan Super League(373), Serie A(135), Bundesliga(78)
      const SELECTED_LEAGUES = [39, 2, 140, 373, 135, 78];

      // First: fetch live matches, filtered to our leagues
      const liveRes = await fetch(
        `https://${API_HOST}/fixtures?live=all`,
        { headers: { 'x-apisports-key': API_KEY } }
      );

      if (!liveRes.ok) throw new Error(`API error: ${liveRes.status}`);
      const liveData = await liveRes.json();

      if (liveData.errors && Object.keys(liveData.errors).length > 0) {
        throw new Error(JSON.stringify(liveData.errors));
      }

      let allMatches: UCLMatch[] = [];

      if (liveData.response && liveData.response.length > 0) {
        allMatches = liveData.response
          .filter((f: any) => SELECTED_LEAGUES.includes(f.league.id))
          .map(mapFixture);
      }

      // Always fetch upcoming matches from selected leagues
      const today = new Date();
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      const formatDate = (d: Date) => d.toISOString().split('T')[0];

      // Fetch today's and tomorrow's fixtures for our leagues
      for (const leagueId of SELECTED_LEAGUES) {
        const season = today.getMonth() >= 7 ? today.getFullYear() : today.getFullYear() - 1;
        const res = await fetch(
          `https://${API_HOST}/fixtures?league=${leagueId}&season=${season}&from=${formatDate(today)}&to=${formatDate(dayAfterTomorrow)}&timezone=UTC`,
          { headers: { 'x-apisports-key': API_KEY } }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.response) {
            const existingIds = new Set(allMatches.map(m => m.id));
            for (const f of data.response) {
              const mapped = mapFixture(f);
              if (!existingIds.has(mapped.id)) {
                allMatches.push(mapped);
                existingIds.add(mapped.id);
              }
            }
          }
        }
      }

      if (allMatches.length === 0) {
        throw new Error('No matches found');
      }

      // Sort: live first, then by date
      allMatches.sort((a, b) => {
        const liveStatuses = ['IN_PLAY', 'LIVE', 'PAUSED'];
        const aLive = liveStatuses.includes(a.status) ? 0 : 1;
        const bLive = liveStatuses.includes(b.status) ? 0 : 1;
        if (aLive !== bLive) return aLive - bLive;
        return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
      });

      const live = allMatches.some(m => ['IN_PLAY', 'LIVE', 'PAUSED'].includes(m.status));
      setMatches(allMatches.slice(0, 15));
      setHasLive(live);
      setError(null);
    } catch (err) {
      console.warn('API-Football fetch failed, using fallback:', err);
      setMatches(FALLBACK_MATCHES);
      setHasLive(false);
      setError('Using fallback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Budget: 100 requests/day. Active window: 19:00–03:00 (UTC+5 Uzbekistan).
    // That's 8 hours = 480 min → fetch every 5 min = ~96 requests/day.
    // Between 03:00–19:00 local time, no fetches (no matches playing).
    const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

    const isActiveHour = () => {
      const now = new Date();
      // Convert to UTC+5 (Uzbekistan)
      const uzHour = (now.getUTCHours() + 5) % 24;
      // Active: 19:00–03:00 UZT (i.e. hour >= 19 OR hour < 3)
      return uzHour >= 19 || uzHour < 3;
    };

    const smartFetch = () => {
      if (isActiveHour()) {
        fetchMatches();
      }
    };

    // Initial fetch: always fetch once to populate data, then schedule
    fetchMatches();
    intervalRef.current = setInterval(smartFetch, INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { matches, loading, error, hasLive };
}
