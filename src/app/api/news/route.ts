import { NextResponse } from 'next/server';
import fallbackNews from '@/data/news.json';
import { getSeasonNewsBoost } from '@/utils/seasons.js';

// ── Types ──────────────────────────────────────────────────────────────────

interface NewsItem {
  id: string;
  headline: string;
  source: string;
  sourceUrl: string;
  date: string;
  tag: string;
  body: string;
  _ts: number; // internal sort key — stripped before sending to client
}

interface NewsItemWithScore extends Omit<NewsItem, '_ts'> {
  relevance: 'personalized' | 'general';
}

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  contentSnippet?: string;
  content?: string;
}

interface FeedResult {
  url: string;
  items: NewsItem[];
  succeeded: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function detectTag(headline: string): string {
  const h = headline.toLowerCase();
  if (/recruit|commit/.test(h))                          return 'Recruiting';
  if (/ranking|ranked/.test(h))                          return 'Rankings';
  if (/qualifier|tournament|rave|bid/.test(h))           return 'Tournament';
  if (/ncaa|rule|settlement/.test(h))                    return 'NCAA';
  if (/national|championship|gjnc/.test(h))              return 'Nationals';
  return 'News';
}

// First 6 significant words, lowercased — used for deduplication
function headlineKey(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    .join(' ');
}

const SEASON_BOOST_KEYWORDS: string[] = getSeasonNewsBoost('volleyball', 'female');

function scoreStory(headline: string): number {
  const h = headline.toLowerCase();
  let score = 0;
  if (/outside hitter|outside-hitter/.test(h)) score += 3;
  if (/volleyball|recruiting|recruit|commit|16u|junior|club/.test(h)) score += 2;
  if (/socal|california|big west|qualifier|tournament|bid/.test(h)) score += 1;
  // Season-aware boost
  if (SEASON_BOOST_KEYWORDS.some(kw => h.includes(kw))) score += 2;
  return score;
}

function formatDate(raw: string | undefined): string {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  } catch {
    return raw;
  }
}

function toTimestamp(raw: string | undefined): number {
  if (!raw) return 0;
  try { return new Date(raw).getTime(); }
  catch { return 0; }
}

// ── Per-feed parser ────────────────────────────────────────────────────────

async function parseFeed(url: string): Promise<FeedResult> {
  try {
    const Parser = (await import('rss-parser')).default;
    const parser = new Parser({ timeout: 8000 });
    const feed = await parser.parseURL(url);

    const source = new URL(url).hostname.replace('www.', '');

    const items: NewsItem[] = (feed.items as RSSItem[])
      .slice(0, 5) // up to 5 per feed before dedup
      .map((item, i) => {
        const headline = item.title?.trim() || 'Untitled';
        const rawDate  = item.isoDate || item.pubDate;
        return {
          id:        `rss-${source}-${i}`,
          headline,
          source,
          sourceUrl: item.link || url,
          date:      formatDate(rawDate),
          tag:       detectTag(headline),
          body:      item.contentSnippet || item.content || '',
          _ts:       toTimestamp(rawDate),
        };
      });

    console.log(`[News API] ✓ ${url} — ${items.length} stories`);
    return { url, items, succeeded: true };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[News API] ✗ ${url} — ${msg}`);
    return { url, items: [], succeeded: false };
  }
}

// ── Route handler ──────────────────────────────────────────────────────────

const FEEDS = [
  'https://jvavolleyball.org/feed/',           // confirmed working
  'https://usavolleyball.org/feed/',
  'https://usavolleyball.org/stories/feed/',
  'https://prepvolleyball.com/feed/',
  'https://prepvolleyball.com/news/feed/',
  'https://prepdig.com/feed/',
  'https://volleytalk.proboards.com/feed/',
  'https://avca.org/feed/',
  'https://avca.org/news-events/feed/',
  'https://vballrecruiter.com/feed/',
];

export async function GET() {
  try {
    const settled = await Promise.allSettled(FEEDS.map(parseFeed));

    const feedResults: FeedResult[] = settled
      .filter((r): r is PromiseFulfilledResult<FeedResult> => r.status === 'fulfilled')
      .map(r => r.value);

    const succeeded = feedResults.filter(r => r.succeeded).length;
    const failed    = feedResults.filter(r => !r.succeeded).length;

    // Merge → sort newest first
    const merged: NewsItem[] = feedResults
      .flatMap(r => r.items)
      .sort((a, b) => b._ts - a._ts);

    // Deduplicate by headline key
    const seen = new Set<string>();
    const deduped = merged.filter(item => {
      const key = headlineKey(item.headline);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Score → sort by score desc, then date desc → top 15 → strip _ts + add relevance
    const scored = deduped.map(item => ({ ...item, _score: scoreStory(item.headline) }));
    scored.sort((a, b) => b._score - a._score || b._ts - a._ts);

    const stories: NewsItemWithScore[] = scored.slice(0, 15).map(({ _ts: _, _score, ...rest }) => ({
      ...rest,
      relevance: _score > 2 ? 'personalized' : 'general',
    }));

    console.log(
      `[News API] ${succeeded} feeds succeeded, ${failed} failed, ${stories.length} stories returned`
    );

    if (stories.length > 0) {
      return NextResponse.json(stories, {
        headers: {
          'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=3600',
        },
      });
    }
  } catch (err) {
    console.error('[News API] Unexpected top-level error:', err);
  }

  // Fallback — /src/data/news.json untouched
  console.log('[News API] Using fallback news.json');
  return NextResponse.json(fallbackNews);
}
