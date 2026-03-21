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
  homeTeam: UCLTeam;
  awayTeam: UCLTeam;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

interface APIResponse {
  matches: UCLMatch[];
}

const API_URL = 'https://api.football-data.org/v4/competitions/CL/matches';

// Fallback static data for when API fails
const FALLBACK_MATCHES: UCLMatch[] = [
  {
    id: 1,
    status: 'SCHEDULED',
    utcDate: '2026-03-25T20:00:00Z',
    matchday: 8,
    stage: 'QUARTER_FINALS',
    homeTeam: { id: 1, name: 'Real Madrid CF', shortName: 'Real Madrid', tla: 'RMA', crest: 'https://crests.football-data.org/86.png' },
    awayTeam: { id: 2, name: 'FC Bayern München', shortName: 'Bayern', tla: 'FCB', crest: 'https://crests.football-data.org/5.png' },
    score: { fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
  },
  {
    id: 2,
    status: 'SCHEDULED',
    utcDate: '2026-03-25T20:00:00Z',
    matchday: 8,
    stage: 'QUARTER_FINALS',
    homeTeam: { id: 3, name: 'FC Barcelona', shortName: 'Barcelona', tla: 'FCB', crest: 'https://crests.football-data.org/81.png' },
    awayTeam: { id: 4, name: 'Manchester City FC', shortName: 'Man City', tla: 'MCI', crest: 'https://crests.football-data.org/65.png' },
    score: { fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
  },
  {
    id: 3,
    status: 'SCHEDULED',
    utcDate: '2026-03-26T20:00:00Z',
    matchday: 8,
    stage: 'QUARTER_FINALS',
    homeTeam: { id: 5, name: 'Arsenal FC', shortName: 'Arsenal', tla: 'ARS', crest: 'https://crests.football-data.org/57.png' },
    awayTeam: { id: 6, name: 'Paris Saint-Germain FC', shortName: 'PSG', tla: 'PSG', crest: 'https://crests.football-data.org/524.png' },
    score: { fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
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
      const res = await fetch(`${API_URL}?status=LIVE,IN_PLAY,PAUSED,SCHEDULED,TIMED&limit=6`, {
        headers: { 'X-Auth-Token': '' }, // free tier works without token for basic requests
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data: APIResponse = await res.json();
      const sorted = data.matches
        .sort((a, b) => {
          const statusOrder: Record<string, number> = { 'IN_PLAY': 0, 'LIVE': 0, 'PAUSED': 1, 'TIMED': 2, 'SCHEDULED': 3 };
          const aOrder = statusOrder[a.status] ?? 4;
          const bOrder = statusOrder[b.status] ?? 4;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
        })
        .slice(0, 6);

      const live = sorted.some(m => ['IN_PLAY', 'LIVE', 'PAUSED'].includes(m.status));
      setMatches(sorted);
      setHasLive(live);
      setError(null);
    } catch {
      // Use fallback data
      setMatches(FALLBACK_MATCHES);
      setHasLive(false);
      setError('Using fallback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    // Refresh every 60s
    intervalRef.current = setInterval(fetchMatches, 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { matches, loading, error, hasLive };
}
