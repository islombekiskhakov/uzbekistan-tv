

# UEFA Champions League Banner Plan

## Overview
Add a football-themed hero banner at the top of the homepage that shows live/upcoming UEFA Champions League matches in a carousel. Clicking "Watch" opens the Setanta Sports 1 channel in the player.

## Data Source
Use the free **football-data.org** API (no auth needed for basic endpoints, or free API key for more). Fetch UCL matches from their `/v4/competitions/CL/matches` endpoint filtered by `status=LIVE,SCHEDULED`. This gives team names, logos (crest URLs), scores, and kick-off times.

Alternatively, since external API keys add friction, we can use a **hybrid approach**:
- Try fetching from `football-data.org` API (free tier, 10 req/min)
- The API key is free to obtain and is a public-facing key (stored in code)
- Fallback to static "next matchday" data if the API fails

## New Files

### 1. `src/hooks/useUCLMatches.ts`
- Custom hook that fetches UCL matches from football-data.org
- Returns `{ matches, loading, error }` with typed match data
- Filters for LIVE, IN_PLAY, PAUSED, SCHEDULED, TIMED statuses
- Groups into: live matches, today's matches, upcoming matches
- Auto-refreshes every 60 seconds for live matches

### 2. `src/components/UCLBanner/UCLBanner.tsx`
- Main banner component with dark green/football-themed gradient background
- Football texture SVG pattern overlay for atmosphere
- UCL logo/branding at the top
- 3 carousel slides using embla-carousel (already installed):
  - **Slide 1**: Currently live match (or next upcoming)
  - **Slide 2**: Next match
  - **Slide 3**: Third match
- Each slide shows:
  - Home team logo + name vs Away team logo + name
  - If LIVE: score, minute, pulsing red "LIVE" badge
  - If upcoming: formatted date/time in Uzbek locale
  - "Tomosha qilish" (Watch) button styled with primary color + glow

### 3. `src/components/UCLBanner/MatchCard.tsx`
- Individual match card component
- Team crests from football-data.org API (free crest URLs)
- VS divider, score display, match status
- Animated entrance with framer-motion

## Changes to Existing Files

### `src/pages/Index.tsx`
- Import `UCLBanner` component
- Add it between Header and ContinueWatching (only when no channel is active)
- Pass `onWatch` callback that finds "Setanta Sports 1" channel and calls `handleSelect`

## Technical Details

- **API**: `https://api.football-data.org/v4/competitions/CL/matches?status=LIVE,SCHEDULED&limit=6`
- **Free tier**: 10 requests/minute, no payment needed. API key is free (sign up at football-data.org)
- **Team logos**: API returns `team.crest` URLs (SVG/PNG)
- **Carousel**: Reuse existing embla-carousel-react dependency
- **Setanta Sports 1 lookup**: Find channel by name match in the channels array (`channel.name` includes "Setanta")
- **Responsive**: Full-width banner, cards stack on mobile
- **Fallback**: If API fails or no matches, banner hides gracefully

## Visual Design
- Dark gradient background with subtle green tint (football pitch feel)
- UCL starball icon/branding
- Team crests displayed large (80-100px)
- Frosted glass card effect for each match
- Auto-playing carousel with dot indicators
- "Jonli" (Live) red pulsing badge for live matches

