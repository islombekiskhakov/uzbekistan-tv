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

const API_KEY = 'c5798e9b8b89728e719f4deeb37a5d99';
const API_HOST = 'v3.football.api-sports.io';

// Map API-Football status to our status
function mapStatus(shortStatus: string): UCLMatch['status'] {
  const map: Record<string, UCLMatch['status']> = {
    'TBD': 'SCHEDULED',
    'NS': 'SCHEDULED',
    '1H': 'IN_PLAY',
    'HT': 'PAUSED',
    '2H': 'IN_PLAY',
    'ET': 'IN_PLAY',
    'BT': 'PAUSED',
    'P': 'IN_PLAY',
    'SUSP': 'PAUSED',
    'INT': 'PAUSED',
    'FT': 'FINISHED',
    'AET': 'FINISHED',
    'PEN': 'FINISHED',
    'PST': 'POSTPONED',
    'CANC': 'CANCELLED',
    'ABD': 'CANCELLED',
    'AWD': 'FINISHED',
    'WO': 'FINISHED',
    'LIVE': 'LIVE',
  };
  return map[shortStatus] || 'SCHEDULED';
}

function mapFixture(fixture: any): UCLMatch {
  const status = mapStatus(fixture.fixture.status.short);
  return {
    id: fixture.fixture.id,
    status,
    utcDate: fixture.fixture.date,
    matchday: fixture.league.round ? parseInt(fixture.league.round.replace(/\D/g, '')) || 0 : 0,
    stage: fixture.league.round || '',
    homeTeam: {
      id: fixture.teams.home.id,
      name: fixture.teams.home.name,
      shortName: fixture.teams.home.name.length > 12 
        ? fixture.teams.home.name.split(' ').slice(0, 2).join(' ') 
        : fixture.teams.home.name,
      tla: fixture.teams.home.name.substring(0, 3).toUpperCase(),
      crest: fixture.teams.home.logo,
    },
    awayTeam: {
      id: fixture.teams.away.id,
      name: fixture.teams.away.name,
      shortName: fixture.teams.away.name.length > 12 
        ? fixture.teams.away.name.split(' ').slice(0, 2).join(' ') 
        : fixture.teams.away.name,
      tla: fixture.teams.away.name.substring(0, 3).toUpperCase(),
      crest: fixture.teams.away.logo,
    },
    score: {
      fullTime: {
        home: fixture.goals.home,
        away: fixture.goals.away,
      },
      halfTime: {
        home: fixture.score.halftime.home,
        away: fixture.score.halftime.away,
      },
    },
  };
}

const emptyScore = { fullTime: { home: null, away: null }, halfTime: { home: null, away: null } };

const FALLBACK_MATCHES: UCLMatch[] = [
  {
    id: 1, status: 'SCHEDULED', utcDate: '2026-04-08T19:00:00Z', matchday: 1, stage: 'Quarter-finals',
    homeTeam: { id: 86, name: 'Real Madrid', shortName: 'Real Madrid', tla: 'RMA', crest: 'https://media.api-sports.io/football/teams/541.png' },
    awayTeam: { id: 5, name: 'Bayern Munich', shortName: 'Bayern', tla: 'BAY', crest: 'https://media.api-sports.io/football/teams/157.png' },
    score: emptyScore,
  },
  {
    id: 2, status: 'SCHEDULED', utcDate: '2026-04-08T19:00:00Z', matchday: 1, stage: 'Quarter-finals',
    homeTeam: { id: 81, name: 'Barcelona', shortName: 'Barcelona', tla: 'BAR', crest: 'https://media.api-sports.io/football/teams/529.png' },
    awayTeam: { id: 4, name: 'Borussia Dortmund', shortName: 'Dortmund', tla: 'BVB', crest: 'https://media.api-sports.io/football/teams/165.png' },
    score: emptyScore,
  },
  {
    id: 3, status: 'SCHEDULED', utcDate: '2026-04-09T19:00:00Z', matchday: 1, stage: 'Quarter-finals',
    homeTeam: { id: 57, name: 'Arsenal', shortName: 'Arsenal', tla: 'ARS', crest: 'https://media.api-sports.io/football/teams/42.png' },
    awayTeam: { id: 524, name: 'Paris Saint Germain', shortName: 'PSG', tla: 'PSG', crest: 'https://media.api-sports.io/football/teams/85.png' },
    score: emptyScore,
  },
  {
    id: 4, status: 'SCHEDULED', utcDate: '2026-04-09T19:00:00Z', matchday: 1, stage: 'Quarter-finals',
    homeTeam: { id: 108, name: 'Inter Milan', shortName: 'Inter', tla: 'INT', crest: 'https://media.api-sports.io/football/teams/505.png' },
    awayTeam: { id: 65, name: 'Manchester City', shortName: 'Man City', tla: 'MCI', crest: 'https://media.api-sports.io/football/teams/50.png' },
    score: emptyScore,
  },
  {
    id: 5, status: 'SCHEDULED', utcDate: '2026-04-15T19:00:00Z', matchday: 2, stage: 'Quarter-finals',
    homeTeam: { id: 5, name: 'Bayern Munich', shortName: 'Bayern', tla: 'BAY', crest: 'https://media.api-sports.io/football/teams/157.png' },
    awayTeam: { id: 86, name: 'Real Madrid', shortName: 'Real Madrid', tla: 'RMA', crest: 'https://media.api-sports.io/football/teams/541.png' },
    score: emptyScore,
  },
  {
    id: 6, status: 'SCHEDULED', utcDate: '2026-04-15T19:00:00Z', matchday: 2, stage: 'Quarter-finals',
    homeTeam: { id: 4, name: 'Borussia Dortmund', shortName: 'Dortmund', tla: 'BVB', crest: 'https://media.api-sports.io/football/teams/165.png' },
    awayTeam: { id: 81, name: 'Barcelona', shortName: 'Barcelona', tla: 'BAR', crest: 'https://media.api-sports.io/football/teams/529.png' },
    score: emptyScore,
  },
  {
    id: 7, status: 'SCHEDULED', utcDate: '2026-04-16T19:00:00Z', matchday: 2, stage: 'Quarter-finals',
    homeTeam: { id: 524, name: 'Paris Saint Germain', shortName: 'PSG', tla: 'PSG', crest: 'https://media.api-sports.io/football/teams/85.png' },
    awayTeam: { id: 57, name: 'Arsenal', shortName: 'Arsenal', tla: 'ARS', crest: 'https://media.api-sports.io/football/teams/42.png' },
    score: emptyScore,
  },
  {
    id: 8, status: 'SCHEDULED', utcDate: '2026-04-16T19:00:00Z', matchday: 2, stage: 'Quarter-finals',
    homeTeam: { id: 65, name: 'Manchester City', shortName: 'Man City', tla: 'MCI', crest: 'https://media.api-sports.io/football/teams/50.png' },
    awayTeam: { id: 108, name: 'Inter Milan', shortName: 'Inter', tla: 'INT', crest: 'https://media.api-sports.io/football/teams/505.png' },
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
      // UEFA Champions League ID = 2 in API-Football, current season
      const season = new Date().getFullYear();
      const res = await fetch(
        `https://${API_HOST}/fixtures?league=2&season=${season}&next=10`,
        {
          headers: {
            'x-apisports-key': API_KEY,
          },
        }
      );

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      
      if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error(JSON.stringify(data.errors));
      }

      if (!data.response || data.response.length === 0) {
        // Try fetching live matches
        const liveRes = await fetch(
          `https://${API_HOST}/fixtures?league=2&season=${season}&live=all`,
          {
            headers: { 'x-apisports-key': API_KEY },
          }
        );
        const liveData = await liveRes.json();
        
        if (liveData.response && liveData.response.length > 0) {
          const mapped = liveData.response.map(mapFixture);
          setMatches(mapped);
          setHasLive(true);
          setError(null);
          return;
        }
        
        throw new Error('No matches found');
      }

      const mapped = data.response.map(mapFixture);
      
      // Sort: live first, then by date
      mapped.sort((a: UCLMatch, b: UCLMatch) => {
        const liveStatuses = ['IN_PLAY', 'LIVE', 'PAUSED'];
        const aLive = liveStatuses.includes(a.status) ? 0 : 1;
        const bLive = liveStatuses.includes(b.status) ? 0 : 1;
        if (aLive !== bLive) return aLive - bLive;
        return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
      });

      const live = mapped.some((m: UCLMatch) => ['IN_PLAY', 'LIVE', 'PAUSED'].includes(m.status));
      setMatches(mapped.slice(0, 8));
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
    fetchMatches();
    // Refresh every 60s for live scores
    intervalRef.current = setInterval(fetchMatches, 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { matches, loading, error, hasLive };
}
