import { NextResponse } from 'next/server';
import fallbackNews from '@/data/nil-news.json';

// ── Types ──────────────────────────────────────────────────────────────────

interface NILStory {
  id: string;
  headline: string;
  source: string;
  sourceUrl: string;
  date: string;
  tag: string;
  body: string;
  _ts?: number;
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
  items: NILStory[];
  succeeded: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const NIL_KEYWORDS = /nil|name image likeness|collective|revenue sharing|house settlement|nil deal/i;

function detectNILTag(headline: string): string {
  const h = headline.toLowerCase();
  if (/ncaa|rule|settlement|enforcement|policy|disclosure/.test(h)) return 'NCAA';
  if (/collective/.test(h))                                          return 'Collective';
  if (/deal|sign|contract|agreement/.test(h))                        return 'Deal';
  if (/revenue|sharing|payout|compensation/.test(h))                 return 'Revenue';
  if (/law|compliance|eligib|state|cif|high school/.test(h))         return 'Policy';
  return 'NCAA';
}

function headlineKey(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    .join(' ');
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

    const items: NILStory[] = (feed.items as RSSItem[])
      .slice(0, 8)
      .filter(item => NIL_KEYWORDS.test(item.title || '') || NIL_KEYWORDS.test(item.contentSnippet || ''))
      .map((item, i) => {
        const headline = item.title?.trim() || 'Untitled';
        const rawDate  = item.isoDate || item.pubDate;
        return {
          id:        `nil-rss-${source}-${i}`,
          headline,
          source,
          sourceUrl: item.link || url,
          date:      formatDate(rawDate),
          tag:       detectNILTag(headline),
          body:      item.contentSnippet || item.content || '',
          _ts:       toTimestamp(rawDate),
        };
      });

    console.log(`[NIL API] ✓ ${url} — ${items.length} NIL stories`);
    return { url, items, succeeded: true };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[NIL API] ✗ ${url} — ${msg}`);
    return { url, items: [], succeeded: false };
  }
}

// ── Route handler ──────────────────────────────────────────────────────────

const FEEDS = [
  'https://on3.com/nil/feed/',
  'https://nilcollegiate.com/feed/',
  'https://frontofficesports.com/feed/',
  'https://nilinsider.co/feed/',
];

export async function GET() {
  try {
    const settled = await Promise.allSettled(FEEDS.map(parseFeed));

    const feedResults: FeedResult[] = settled
      .filter((r): r is PromiseFulfilledResult<FeedResult> => r.status === 'fulfilled')
      .map(r => r.value);

    // Merge → sort newest first
    const merged: NILStory[] = feedResults
      .flatMap(r => r.items)
      .sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0));

    // Deduplicate by headline key
    const seen = new Set<string>();
    const deduped = merged.filter(item => {
      const key = headlineKey(item.headline);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Strip internal sort key
    const stories = deduped.slice(0, 15).map(({ _ts: _, ...rest }) => rest);

    const succeeded = feedResults.filter(r => r.succeeded).length;
    console.log(`[NIL API] ${succeeded}/${FEEDS.length} feeds succeeded, ${stories.length} stories returned`);

    if (stories.length > 0) {
      return NextResponse.json(stories, {
        headers: {
          'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=3600',
        },
      });
    }
  } catch (err) {
    console.error('[NIL API] Unexpected error:', err);
  }

  // Fallback to seed data
  console.log('[NIL API] Using fallback nil-news.json');
  return NextResponse.json(fallbackNews);
}
