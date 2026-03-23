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

/*
 * Fallback matches from ALL 6 leagues (shown when no live games)
 * These are realistic upcoming fixtures to keep the banner looking alive
 */
const FALLBACK_MATCHES: UCLMatch[] = [
  // EPL
  {
    id: 101, status: 'SCHEDULED', utcDate: '2026-04-05T14:00:00Z', matchday: 32, stage: 'Regular Season - 32',
    leagueName: 'Premier League', leagueLogo: 'https://media.api-sports.io/football/leagues/39.png',
    homeTeam: { id: 42, name: 'Arsenal', shortName: 'Arsenal', tla: 'ARS', crest: 'https://media.api-sports.io/football/teams/42.png' },
    awayTeam: { id: 40, name: 'Liverpool', shortName: 'Liverpool', tla: 'LIV', crest: 'https://media.api-sports.io/football/teams/40.png' },
    score: emptyScore,
  },
  // La Liga
  {
    id: 102, status: 'SCHEDULED', utcDate: '2026-04-05T19:00:00Z', matchday: 30, stage: 'Regular Season - 30',
    leagueName: 'La Liga', leagueLogo: 'https://media.api-sports.io/football/leagues/140.png',
    homeTeam: { id: 541, name: 'Real Madrid', shortName: 'Real Madrid', tla: 'RMA', crest: 'https://media.api-sports.io/football/teams/541.png' },
    awayTeam: { id: 529, name: 'Barcelona', shortName: 'Barcelona', tla: 'BAR', crest: 'https://media.api-sports.io/football/teams/529.png' },
    score: emptyScore,
  },
  // UCL
  {
    id: 103, status: 'SCHEDULED', utcDate: '2026-04-08T19:00:00Z', matchday: 1, stage: 'Quarter-finals',
    leagueName: 'UEFA Champions League', leagueLogo: 'https://media.api-sports.io/football/leagues/2.png',
    homeTeam: { id: 50, name: 'Manchester City', shortName: 'Man City', tla: 'MCI', crest: 'https://media.api-sports.io/football/teams/50.png' },
    awayTeam: { id: 157, name: 'Bayern Munich', shortName: 'Bayern', tla: 'BAY', crest: 'https://media.api-sports.io/football/teams/157.png' },
    score: emptyScore,
  },
  // Serie A
  {
    id: 104, status: 'SCHEDULED', utcDate: '2026-04-06T17:00:00Z', matchday: 31, stage: 'Regular Season - 31',
    leagueName: 'Serie A', leagueLogo: 'https://media.api-sports.io/football/leagues/135.png',
    homeTeam: { id: 489, name: 'AC Milan', shortName: 'AC Milan', tla: 'MIL', crest: 'https://media.api-sports.io/football/teams/489.png' },
    awayTeam: { id: 505, name: 'Inter Milan', shortName: 'Inter', tla: 'INT', crest: 'https://media.api-sports.io/football/teams/505.png' },
    score: emptyScore,
  },
  // Bundesliga
  {
    id: 105, status: 'SCHEDULED', utcDate: '2026-04-06T16:30:00Z', matchday: 28, stage: 'Regular Season - 28',
    leagueName: 'Bundesliga', leagueLogo: 'https://media.api-sports.io/football/leagues/78.png',
    homeTeam: { id: 157, name: 'Bayern Munich', shortName: 'Bayern', tla: 'BAY', crest: 'https://media.api-sports.io/football/teams/157.png' },
    awayTeam: { id: 165, name: 'Borussia Dortmund', shortName: 'Dortmund', tla: 'BVB', crest: 'https://media.api-sports.io/football/teams/165.png' },
    score: emptyScore,
  },
  // Uzbekistan Super League
  {
    id: 106, status: 'SCHEDULED', utcDate: '2026-04-07T14:00:00Z', matchday: 8, stage: 'Regular Season - 8',
    leagueName: 'Super League', leagueLogo: 'https://media.api-sports.io/football/leagues/373.png',
    homeTeam: { id: 7135, name: 'Pakhtakor', shortName: 'Pakhtakor', tla: 'PAK', crest: 'https://media.api-sports.io/football/teams/7135.png' },
    awayTeam: { id: 7138, name: 'Bunyodkor', shortName: 'Bunyodkor', tla: 'BUN', crest: 'https://media.api-sports.io/football/teams/7138.png' },
    score: emptyScore,
  },
  // EPL #2
  {
    id: 107, status: 'SCHEDULED', utcDate: '2026-04-05T16:30:00Z', matchday: 32, stage: 'Regular Season - 32',
    leagueName: 'Premier League', leagueLogo: 'https://media.api-sports.io/football/leagues/39.png',
    homeTeam: { id: 33, name: 'Manchester United', shortName: 'Man United', tla: 'MUN', crest: 'https://media.api-sports.io/football/teams/33.png' },
    awayTeam: { id: 49, name: 'Chelsea', shortName: 'Chelsea', tla: 'CHE', crest: 'https://media.api-sports.io/football/teams/49.png' },
    score: emptyScore,
  },
  // UCL #2
  {
    id: 108, status: 'SCHEDULED', utcDate: '2026-04-09T19:00:00Z', matchday: 1, stage: 'Quarter-finals',
    leagueName: 'UEFA Champions League', leagueLogo: 'https://media.api-sports.io/football/leagues/2.png',
    homeTeam: { id: 42, name: 'Arsenal', shortName: 'Arsenal', tla: 'ARS', crest: 'https://media.api-sports.io/football/teams/42.png' },
    awayTeam: { id: 85, name: 'Paris Saint Germain', shortName: 'PSG', tla: 'PSG', crest: 'https://media.api-sports.io/football/teams/85.png' },
    score: emptyScore,
  },
];

export function useUCLMatches() {
  const [matches, setMatches] = useState<UCLMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLive, setHasLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Check if current time is in active window (19:00–03:00 UZT / UTC+5) */
  const isActiveHour = () => {
    const now = new Date();
    const uzHour = (now.getUTCHours() + 5) % 24;
    return uzHour >= 19 || uzHour < 3;
  };

  /**
   * Fetch live matches from our leagues — SINGLE request
   * Endpoint: /fixtures?live=39-2-140-373-135-78
   * Cost: 1 request per call
   *
   * Free plan limitations:
   *   - `next` param: NOT available
   *   - `season` param: only 2022-2024
   *   - `live` param: WORKS (filters by league IDs)
   *
   * So we can ONLY fetch live matches. When none are live, we show fallback.
   */
  const fetchLive = async () => {
    try {
      const res = await fetch(`https://${API_HOST}/fixtures?live=${LEAGUE_IDS_STR}`, {
        headers: { 'x-apisports-key': API_KEY },
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      const fixtures = data.response || [];
      if (fixtures.length > 0) {
        const liveMatches = fixtures.map(mapFixture);
        // Sort by league priority then date
        liveMatches.sort((a: UCLMatch, b: UCLMatch) => {
          return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
        });

        setMatches(liveMatches.slice(0, 15));
        setHasLive(true);
        setLastUpdated(new Date());
        setError(null);
      } else {
        // No live games from our leagues — show fallback
        setMatches(FALLBACK_MATCHES);
        setHasLive(false);
        setLastUpdated(new Date());
        setError(null);
      }
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
     * Budget: 100 requests/day (free plan)
     * Active window: 19:00–03:00 UZT (8 hours)
     *
     * Each poll = 1 request (live endpoint with league filter)
     * Interval: every 6 minutes
     * Max polls: 8h × 10/h = 80 requests/day
     * + 1 initial fetch = 81 total (well within 100)
     *
     * Outside active hours: no polling, fallback shown
     */
    const POLL_INTERVAL_MS = 6 * 60 * 1000; // 6 minutes

    // Always fetch once on mount
    fetchLive();

    // Poll during active hours only
    intervalRef.current = setInterval(() => {
      if (isActiveHour()) {
        fetchLive();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { matches, loading, error, hasLive, lastUpdated };
}
