import { NextResponse } from "next/server";

export const revalidate = 86400; // 24-hour cache

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ── Shared types ──────────────────────────────────────────────────

export interface RankingEntry {
  rank: number;
  name: string;
  city: string;
  state: string;
  record: string | null;
  division: string | null;
  source: string;
  type: string;
  scoutlyAthletes: number | null;
}

interface FetchResult {
  data: RankingEntry[];
  lastUpdated: string | null;
}

// ── HTML utilities ────────────────────────────────────────────────

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parseRecord(s: string): string | null {
  const m = s.match(/(\d{1,3})\s*[–\-]\s*(\d{1,3})/);
  return m ? `${m[1]}–${m[2]}` : null;
}

// ── Last-updated date extraction ──────────────────────────────────

function extractLastUpdated(html: string): string | null {
  // Search __NEXT_DATA__ JSON for ISO date fields near "updated" keys
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (nextDataMatch) {
    const json = nextDataMatch[1];
    const isoField = json.match(/"(?:lastUpdated|updatedDate|rankingDate|lastModified|publishedDate)"\s*:\s*"(\d{4}-\d{2}-\d{2})/i);
    if (isoField) {
      const d = new Date(isoField[1] + "T12:00:00Z");
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      }
    }
  }

  // Try inline ISO dates anywhere in the raw HTML
  const inlineIso = html.match(/"(?:lastUpdated|updatedDate|rankingDate)"\s*:\s*"(\d{4}-\d{2}-\d{2})/i);
  if (inlineIso) {
    const d = new Date(inlineIso[1] + "T12:00:00Z");
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }
  }

  // Try human-readable text patterns in the page
  const textPatterns = [
    /last\s+updated[:\s]+([A-Za-z]+ \d{1,2},?\s*\d{4})/i,
    /rankings?\s+updated[:\s]+([A-Za-z]+ \d{1,2},?\s*\d{4})/i,
    /updated[:\s]+([A-Za-z]+ \d{1,2},?\s*\d{4})/i,
    /as\s+of[:\s]+([A-Za-z]+ \d{1,2},?\s*\d{4})/i,
  ];
  for (const pat of textPatterns) {
    const m = html.match(pat);
    if (m) return m[1].replace(/,?\s+/, ", ").trim();
  }

  return null;
}

// ── __NEXT_DATA__ extraction (Next.js SSR sites like MaxPreps) ────

function extractNextData(html: string): unknown {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

// Recursively find arrays that look like ranking data
function findRankingArrays(obj: unknown, depth = 0): Record<string, unknown>[][] {
  if (depth > 10 || !obj || typeof obj !== "object") return [];
  const results: Record<string, unknown>[][] = [];

  if (Array.isArray(obj)) {
    if (obj.length >= 3 && typeof obj[0] === "object" && obj[0] !== null) {
      const sample = obj[0] as Record<string, unknown>;
      const keys = Object.keys(sample).join(" ").toLowerCase();
      if (
        (keys.includes("rank") || keys.includes("ranking")) &&
        (keys.includes("name") || keys.includes("school") || keys.includes("team"))
      ) {
        results.push(obj as Record<string, unknown>[]);
      }
    }
    for (const item of obj.slice(0, 10)) {
      results.push(...findRankingArrays(item, depth + 1));
    }
  } else {
    for (const val of Object.values(obj as Record<string, unknown>).slice(0, 30)) {
      results.push(...findRankingArrays(val, depth + 1));
    }
  }

  return results;
}

function parseNextDataRankings(data: unknown, type: string, source: string): RankingEntry[] {
  const arrays = findRankingArrays(data);
  const entries: RankingEntry[] = [];

  for (const arr of arrays) {
    for (const item of arr) {
      const rank = Number(
        item.rank ?? item.ranking ?? item.overallRank ?? item.rankNumber ?? 0
      );
      if (!rank || rank > 500) continue;

      const name = String(
        item.schoolName ?? item.teamName ?? item.name ?? item.school ?? ""
      ).trim();
      if (name.length < 2) continue;

      const city = String(item.city ?? item.cityName ?? "").trim();
      const state = String(
        item.stateAbbreviation ?? item.state ?? item.stateCode ?? ""
      )
        .trim()
        .toUpperCase()
        .slice(0, 2);

      const wins = Number(item.wins ?? item.overallWins ?? 0);
      const losses = Number(item.losses ?? item.overallLosses ?? 0);
      const record = wins || losses ? `${wins}–${losses}` : null;
      const division = String(
        item.division ?? item.divisionName ?? item.classification ?? ""
      ).trim() || null;

      if (!entries.find((e) => e.rank === rank)) {
        entries.push({ rank, name, city, state, record, division, source, type, scoutlyAthletes: null });
      }
    }
    if (entries.length >= 25) break;
  }

  return entries.sort((a, b) => a.rank - b.rank).slice(0, 25);
}

// ── Table-based HTML parser (fallback for MaxPreps / AES) ─────────

function parseHTMLTable(
  html: string,
  type: string,
  source: string,
  defaultState = ""
): RankingEntry[] {
  const entries: RankingEntry[] = [];

  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
      .map((m) => stripTags(m[1]))
      .filter(Boolean);

    if (cells.length < 2) continue;

    const rank = parseInt(cells[0]);
    if (isNaN(rank) || rank < 1 || rank > 500) continue;

    const name = (cells[1] || cells[2] || "").trim();
    if (name.length < 2) continue;

    const record = cells.map((c) => parseRecord(c)).find(Boolean) ?? null;

    const locCell = cells.find((c) => /,\s*[A-Z]{2}/.test(c));
    const locMatch = locCell?.match(/^(.+),\s*([A-Z]{2})$/);

    const divCell =
      cells.find((c) => /^D[1-9]$/.test(c.trim()) || /^Open$/i.test(c.trim())) ?? null;

    if (!entries.find((e) => e.rank === rank)) {
      entries.push({
        rank,
        name,
        city: locMatch?.[1]?.trim() ?? "",
        state: locMatch?.[2] ?? defaultState,
        record,
        division: divCell?.trim() ?? null,
        source,
        type,
        scoutlyAthletes: null,
      });
    }

    if (entries.length >= 25) break;
  }

  return entries.sort((a, b) => a.rank - b.rank);
}

// ── Rankings-page record extraction (before individual team fetches) ──

/**
 * Tries to extract W-L records directly from the rankings list HTML/JSON,
 * so we don't need to hit individual team pages for common cases.
 * Also logs diagnostic context around rank-1 school for debugging.
 */
function extractRecordsFromRankingsPage(
  html: string,
  entries: RankingEntry[]
): RankingEntry[] {
  if (entries.length === 0) return entries;

  // ── 1. Diagnostic: log raw HTML around the first school name ─────
  const firstEntry = entries[0];
  const searchWord = firstEntry.name.split(/\s+/)[0].toLowerCase();
  const firstOccurrence = html.toLowerCase().indexOf(searchWord);
  if (firstOccurrence >= 0) {
    const start = Math.max(0, firstOccurrence - 300);
    const end = Math.min(html.length, firstOccurrence + 1500);
    console.log(
      `[MaxPreps rank-1 "${firstEntry.name}" HTML context (chars ${start}–${end})]:\n` +
      html.slice(start, end)
    );
  } else {
    console.log(
      `[MaxPreps rank-1 "${firstEntry.name}": first word not found in HTML — logging first 2000 chars]:\n` +
      html.slice(0, 2000)
    );
  }

  // ── 2. Collect all plausible W-L patterns in document order ──────
  // Broad scan: any "NN-NN" / "NN–NN" with realistic volleyball totals
  const allFoundRecords: string[] = [];
  const broadPat = /\b(\d{1,2})\s*[-–]\s*(\d{1,2})\b/g;
  let bm: RegExpExecArray | null;
  while ((bm = broadPat.exec(html)) !== null) {
    const w = parseInt(bm[1]);
    const l = parseInt(bm[2]);
    if (w >= 1 && w <= 50 && l >= 0 && l <= 50 && w + l >= 5 && w + l <= 55) {
      allFoundRecords.push(`${w}–${l}`);
    }
  }
  console.log(
    `[MaxPreps HTML broad W-L scan]: found ${allFoundRecords.length} patterns: ` +
    allFoundRecords.slice(0, 30).join(", ")
  );

  // ── 3. class/data-attribute targeted patterns ────────────────────
  // Look for elements whose class or data attribute signals a record value
  const classOrDataPats: RegExp[] = [
    // <anything class="...record...">28-4</...>
    /class="[^"]*(?:record|wl\b|win-loss|wins|losses)[^"]*"[^>]*>\s*(\d{1,2})\s*[-–]\s*(\d{1,2})\s*</gi,
    // data-record="28-4" or data-wl="28-4"
    /data-(?:record|wl|win-?loss)[^=]*="\s*(\d{1,2})\s*[-–]\s*(\d{1,2})\s*"/gi,
    // "record":"28-4" in any inline JSON blob
    /"(?:record|wl|winLoss|win_loss|overallRecord)"\s*:\s*"(\d{1,2})\s*[-–]\s*(\d{1,2})"/gi,
  ];

  const classHits: string[] = [];
  for (const pat of classOrDataPats) {
    let cm: RegExpExecArray | null;
    while ((cm = pat.exec(html)) !== null) {
      const w = parseInt(cm[1]);
      const l = parseInt(cm[2]);
      if (w >= 1 && w <= 50 && l >= 0 && l <= 50) {
        classHits.push(`${w}–${l}`);
      }
    }
  }
  console.log(
    `[MaxPreps HTML class/data-attr patterns]: found ${classHits.length}: ` +
    classHits.slice(0, 20).join(", ")
  );

  // ── 4. Proximity matching: school name → nearby W-L ──────────────
  // For each entry still missing a record, search for its name in the HTML
  // and look for a W-L pattern within 600 chars after it.
  const lowerHtml = html.toLowerCase();
  const updated = entries.map((entry) => {
    if (entry.record !== null) return entry;

    const baseName = entry.name
      .toLowerCase()
      .replace(/\s+high\s+school$|\s+hs$/i, "")
      .trim();
    const words = baseName.split(/\s+/).filter((w) => w.length > 3);
    if (words.length === 0) return entry;

    // Try each significant word as an anchor
    for (const word of words) {
      let pos = lowerHtml.indexOf(word);
      while (pos >= 0) {
        // Look forward up to 600 chars for a W-L pattern
        const window = html.slice(pos, Math.min(html.length, pos + 600));
        const wlMatch = window.match(/\b(\d{1,2})\s*[-–]\s*(\d{1,2})\b/);
        if (wlMatch) {
          const w = parseInt(wlMatch[1]);
          const l = parseInt(wlMatch[2]);
          if (w >= 1 && w <= 50 && l >= 0 && l <= 50 && w + l >= 5) {
            console.log(
              `[${entry.name}]: proximity match record=${w}–${l} (anchor="${word}")`
            );
            return { ...entry, record: `${w}–${l}` };
          }
        }
        pos = lowerHtml.indexOf(word, pos + 1);
        if (pos > lowerHtml.length * 0.9) break; // don't scan footer noise
      }
    }
    return entry;
  });

  const found = updated.filter((e) => e.record !== null).length;
  const before = entries.filter((e) => e.record !== null).length;
  console.log(
    `[MaxPreps rankings-page extraction]: ${found - before} new records found ` +
    `(${found}/${updated.length} total now have records)`
  );

  return updated;
}

// ── School-level record enrichment ────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

// Extract W-L record from a MaxPreps team page (HTML or __NEXT_DATA__)
function extractRecordFromPage(html: string): string | null {
  const nextData = extractNextData(html);
  if (nextData) {
    const json = JSON.stringify(nextData);

    // Wins + losses as separate numbers
    const winsM  = json.match(/"(?:overallWins|wins|totalWins|seasonWins|w)"\s*:\s*(\d+)/i);
    const lossM  = json.match(/"(?:overallLosses|losses|totalLosses|seasonLosses|l)"\s*:\s*(\d+)/i);
    if (winsM && lossM) {
      const w = parseInt(winsM[1]);
      const l = parseInt(lossM[1]);
      if (w < 60 && l < 60 && (w > 0 || l > 0)) return `${w}–${l}`;
    }

    // Record as a string field
    const recM = json.match(/"(?:overallRecord|record|seasonRecord|wlRecord|overallWinLoss)"\s*:\s*"(\d{1,2}[\s\-–]+\d{1,2})"/i);
    if (recM) return parseRecord(recM[1]);
  }

  // Text-level patterns (rendered HTML)
  const textPatterns: RegExp[] = [
    /overall\s+record[:\s]+(\d{1,2})\s*[-–]\s*(\d{1,2})/i,
    /season\s+record[:\s]+(\d{1,2})\s*[-–]\s*(\d{1,2})/i,
    /(\d{1,2})\s*[-–]\s*(\d{1,2})\s*overall/i,
    /"wl"\s*:\s*"(\d{1,2})-(\d{1,2})"/,
    /\bW-L[:\s]+(\d{1,2})-(\d{1,2})/i,
  ];
  for (const pat of textPatterns) {
    const m = html.match(pat);
    if (m && m[2]) {
      const w = parseInt(m[1]);
      const l = parseInt(m[2]);
      if (w < 60 && l < 60) return `${w}–${l}`;
    }
  }

  return null;
}

// Pull team-page hrefs out of a MaxPreps rankings HTML page
function extractMaxPrepsTeamUrls(html: string): Map<string, string> {
  const map = new Map<string, string>();
  // MaxPreps school URLs look like /ca/manhattan-beach/mira-costa-mustangs/volleyball/
  const pattern = /href="(\/[a-z]{2}\/[^/"]+\/[^/"]+\/volleyball\/[^"]*)"/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(html)) !== null) {
    const path = m[1].split("?")[0]; // strip query strings
    const parts = path.split("/").filter(Boolean);
    if (parts.length >= 3) {
      map.set(parts[2].toLowerCase(), `https://www.maxpreps.com${path}`);
    }
  }
  return map;
}

// For each entry missing a record, try to scrape it from the school's team page
async function enrichWithRecords(
  entries: RankingEntry[],
  rankingsHtml: string
): Promise<RankingEntry[]> {
  const missing = entries.filter((e) => e.record === null).slice(0, 10);
  if (missing.length === 0) return entries;

  const teamUrlMap = extractMaxPrepsTeamUrls(rankingsHtml);

  const enriched = await Promise.allSettled(
    missing.map(async (entry) => {
      // Match school name words against URL slugs
      const baseName = entry.name
        .toLowerCase()
        .replace(/\s+high\s+school$|\s+hs$/i, "")
        .trim();
      const words = baseName.split(/\s+/).filter((w) => w.length > 2);

      let teamUrl: string | undefined;
      for (const [slug, url] of teamUrlMap) {
        const hits = words.filter((w) => slug.includes(w)).length;
        if (hits >= Math.min(2, words.length)) {
          teamUrl = url;
          break;
        }
      }

      if (!teamUrl) {
        console.log(`[${entry.name}]: record=null (no matching URL in rankings page)`);
        return { rank: entry.rank, record: null as string | null };
      }

      try {
        const res = await withTimeout(
          fetch(teamUrl, {
            headers: {
              "User-Agent": UA,
              Accept: "text/html,application/xhtml+xml",
              "Accept-Language": "en-US,en;q=0.9",
            },
            next: { revalidate: 86400 },
          }),
          4000
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const pageHtml = await res.text();
        const record = extractRecordFromPage(pageHtml);
        console.log(`[${entry.name}]: record=${record ?? "null"}`);
        return { rank: entry.rank, record };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`[${entry.name}]: record=null (${msg})`);
        return { rank: entry.rank, record: null as string | null };
      }
    })
  );

  const recordMap = new Map<number, string | null>();
  for (const result of enriched) {
    if (result.status === "fulfilled") {
      recordMap.set(result.value.rank, result.value.record);
    }
  }

  return entries.map((e) => {
    if (e.record !== null) return e;
    const scraped = recordMap.get(e.rank);
    return scraped !== undefined ? { ...e, record: scraped } : e;
  });
}

// ── MaxPreps fetcher ──────────────────────────────────────────────

async function fetchMaxPreps(
  url: string,
  type: string,
  source: string
): Promise<FetchResult> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.google.com/",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const html = await res.text();

  const lastUpdated = extractLastUpdated(html);

  // Try __NEXT_DATA__ first (MaxPreps is a Next.js app)
  const nextData = extractNextData(html);
  if (nextData) {
    const parsed = parseNextDataRankings(nextData, type, source);
    if (parsed.length > 0) {
      // Stage 1: extract records directly from the rankings page HTML/JSON
      const stage1 = extractRecordsFromRankingsPage(html, parsed);
      // Stage 2: fetch individual team pages for any still-missing records
      const enriched = await enrichWithRecords(stage1, html);
      return { data: enriched, lastUpdated };
    }
  }

  // Fall back to table parsing
  const isCA = type.includes("ca");
  const tableParsed = parseHTMLTable(html, type, source, isCA ? "CA" : "");
  if (tableParsed.length > 0) {
    const stage1 = extractRecordsFromRankingsPage(html, tableParsed);
    const enriched = await enrichWithRecords(stage1, html);
    return { data: enriched, lastUpdated };
  }

  throw new Error(`No parseable data found at ${url}`);
}

// ── AES fetcher ───────────────────────────────────────────────────

async function fetchAES(
  url: string,
  type: string,
  source: string
): Promise<FetchResult> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const html = await res.text();

  // AES may embed ranking JSON in script tags
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of scripts) {
    const content = m[1];
    if (!content.includes("rank") && !content.includes("team")) continue;

    // Look for JSON arrays in the script
    const jsonMatches = content.matchAll(/(\[[\s\S]{20,10000}?\])/g);
    for (const jm of jsonMatches) {
      try {
        const arr = JSON.parse(jm[1]);
        if (!Array.isArray(arr) || arr.length < 3) continue;

        const entries: RankingEntry[] = [];
        for (const item of arr) {
          if (typeof item !== "object" || item === null) continue;
          const obj = item as Record<string, unknown>;
          const rank = Number(obj.rank ?? obj.ranking ?? obj.position ?? 0);
          if (!rank || rank > 500) continue;
          const name = String(
            obj.teamName ?? obj.name ?? obj.clubName ?? obj.club ?? ""
          ).trim();
          if (name.length < 2) continue;
          const region = String(obj.region ?? obj.regionName ?? obj.state ?? "").trim();
          entries.push({
            rank,
            name,
            city: "",
            state: region,
            record: null,
            division: null,
            source,
            type,
            scoutlyAthletes: null,
          });
        }

        if (entries.length >= 5) {
          return { data: entries.sort((a, b) => a.rank - b.rank).slice(0, 25), lastUpdated: null };
        }
      } catch {
        continue;
      }
    }
  }

  // Fall back to table
  const tableParsed = parseHTMLTable(html, type, source);
  if (tableParsed.length > 0) return { data: tableParsed, lastUpdated: null };

  throw new Error(`No parseable data found at ${url}`);
}

// ── vballrecruiter fetcher ────────────────────────────────────────

async function fetchVballRecruiter(
  url: string,
  type: string,
  source: string
): Promise<FetchResult> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const html = await res.text();

  const entries: RankingEntry[] = [];

  // Strip scripts/styles then extract text
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  const text = stripTags(cleaned);

  // WordPress category pages list article titles — look for numbered patterns
  // Pattern: "1. Club Name" / "#1 Club Name" / "1 Club Name – Location"
  const rankPattern = /(?:^|[\s\n])#?(\d{1,2})[.):\s]+([A-Z][^\n\r.]{3,60?)(?:\s*[–\-]\s*([^\n\r]{3,40}))?/gm;

  let m: RegExpExecArray | null;
  while ((m = rankPattern.exec(text)) !== null) {
    const rank = parseInt(m[1]);
    if (rank < 1 || rank > 50) continue;
    const name = m[2].trim();
    if (name.length < 3) continue;

    const locStr = m[3] ?? "";
    const locMatch = locStr.match(/([A-Za-z\s]+),?\s*([A-Z]{2})$/);

    if (!entries.find((e) => e.rank === rank)) {
      entries.push({
        rank,
        name,
        city: locMatch?.[1]?.trim() ?? "",
        state: locMatch?.[2] ?? "",
        record: null,
        division: null,
        source,
        type,
        scoutlyAthletes: null,
      });
    }
  }

  if (entries.length < 3) throw new Error(`Too few entries parsed from ${url}`);
  return { data: entries.sort((a, b) => a.rank - b.rank).slice(0, 25), lastUpdated: null };
}

// ── Seed data (fallback when all sources fail) ────────────────────

const SEED_GIRLS_CA: RankingEntry[] = [
  { rank: 1,  name: "Mira Costa HS",       city: "Manhattan Beach", state: "CA", record: "28–4",  division: "D1", source: "seed", type: "varsity_girls_ca", scoutlyAthletes: 3 },
  { rank: 2,  name: "Marymount HS",         city: "Los Angeles",     state: "CA", record: "29–3",  division: "D1", source: "seed", type: "varsity_girls_ca", scoutlyAthletes: 1 },
  { rank: 3,  name: "Redondo Union HS",     city: "Redondo Beach",   state: "CA", record: "26–6",  division: "D1", source: "seed", type: "varsity_girls_ca", scoutlyAthletes: 2 },
  { rank: 4,  name: "Palos Verdes HS",      city: "Palos Verdes",    state: "CA", record: "25–7",  division: "D1", source: "seed", type: "varsity_girls_ca", scoutlyAthletes: 2 },
  { rank: 5,  name: "Corona del Mar HS",    city: "Newport Beach",   state: "CA", record: "24–8",  division: "D1", source: "seed", type: "varsity_girls_ca", scoutlyAthletes: 1 },
  { rank: 6,  name: "Viewpoint HS",          city: "Calabasas",       state: "CA", record: "27–5",  division: "D2", source: "seed", type: "varsity_girls_ca", scoutlyAthletes: 1 },
  { rank: 7,  name: "Bishop Montgomery HS", city: "Torrance",        state: "CA", record: "23–9",  division: "D2", source: "seed", type: "varsity_girls_ca", scoutlyAthletes: 2 },
  { rank: 8,  name: "El Segundo HS",         city: "El Segundo",      state: "CA", record: "26–6",  division: "D3", source: "seed", type: "varsity_girls_ca", scoutlyAthletes: 3 },
  { rank: 9,  name: "South Torrance HS",     city: "Torrance",        state: "CA", record: "22–10", division: "D3", source: "seed", type: "varsity_girls_ca", scoutlyAthletes: 1 },
  { rank: 10, name: "Peninsula HS",           city: "Rolling Hills",   state: "CA", record: "21–11", division: "D2", source: "seed", type: "varsity_girls_ca", scoutlyAthletes: 1 },
];

const SEED_GIRLS_NATIONAL: RankingEntry[] = [
  { rank: 1,  name: "Mira Costa HS",       city: "Manhattan Beach",  state: "CA", record: "28–4",  division: "D1", source: "seed", type: "varsity_girls_national", scoutlyAthletes: 3 },
  { rank: 2,  name: "Marymount HS",         city: "Los Angeles",      state: "CA", record: "29–3",  division: "D1", source: "seed", type: "varsity_girls_national", scoutlyAthletes: 1 },
  { rank: 3,  name: "Assumption HS",        city: "Louisville",       state: "KY", record: "32–2",  division: "D1", source: "seed", type: "varsity_girls_national", scoutlyAthletes: null },
  { rank: 4,  name: "The Woodlands HS",     city: "The Woodlands",    state: "TX", record: "30–4",  division: "D1", source: "seed", type: "varsity_girls_national", scoutlyAthletes: null },
  { rank: 5,  name: "Servite HS",           city: "Anaheim",          state: "CA", record: "28–5",  division: "D1", source: "seed", type: "varsity_girls_national", scoutlyAthletes: null },
  { rank: 6,  name: "Briarcrest Christian", city: "Memphis",           state: "TN", record: "31–3",  division: "D1", source: "seed", type: "varsity_girls_national", scoutlyAthletes: null },
  { rank: 7,  name: "Redondo Union HS",     city: "Redondo Beach",    state: "CA", record: "26–6",  division: "D1", source: "seed", type: "varsity_girls_national", scoutlyAthletes: 2 },
  { rank: 8,  name: "Palos Verdes HS",      city: "Palos Verdes",     state: "CA", record: "25–7",  division: "D1", source: "seed", type: "varsity_girls_national", scoutlyAthletes: 2 },
  { rank: 9,  name: "Bishop Gorman HS",     city: "Las Vegas",        state: "NV", record: "27–5",  division: "D1", source: "seed", type: "varsity_girls_national", scoutlyAthletes: null },
  { rank: 10, name: "St. Francis HS",       city: "Mountain View",    state: "CA", record: "25–7",  division: "D1", source: "seed", type: "varsity_girls_national", scoutlyAthletes: null },
];

const SEED_BOYS_CA: RankingEntry[] = [
  { rank: 1,  name: "Loyola HS",             city: "Los Angeles",       state: "CA", record: "28–2",  division: "D1", source: "seed", type: "varsity_boys_ca", scoutlyAthletes: 4 },
  { rank: 2,  name: "Palisades Charter HS",  city: "Pacific Palisades", state: "CA", record: "25–5",  division: "D1", source: "seed", type: "varsity_boys_ca", scoutlyAthletes: 3 },
  { rank: 3,  name: "Newport Harbor HS",     city: "Newport Beach",     state: "CA", record: "24–6",  division: "D1", source: "seed", type: "varsity_boys_ca", scoutlyAthletes: 3 },
  { rank: 4,  name: "Beverly Hills HS",      city: "Beverly Hills",     state: "CA", record: "26–4",  division: "D1", source: "seed", type: "varsity_boys_ca", scoutlyAthletes: 2 },
  { rank: 5,  name: "St. Anthony HS",        city: "Long Beach",        state: "CA", record: "22–8",  division: "D1", source: "seed", type: "varsity_boys_ca", scoutlyAthletes: 2 },
  { rank: 6,  name: "Redondo Union HS",      city: "Redondo Beach",     state: "CA", record: "21–9",  division: "D1", source: "seed", type: "varsity_boys_ca", scoutlyAthletes: 2 },
  { rank: 7,  name: "Santa Barbara HS",      city: "Santa Barbara",     state: "CA", record: "24–5",  division: "D2", source: "seed", type: "varsity_boys_ca", scoutlyAthletes: 1 },
  { rank: 8,  name: "Mira Costa HS",         city: "Manhattan Beach",   state: "CA", record: "20–10", division: "D2", source: "seed", type: "varsity_boys_ca", scoutlyAthletes: 2 },
  { rank: 9,  name: "Huntington Beach HS",   city: "Huntington Beach",  state: "CA", record: "19–11", division: "D2", source: "seed", type: "varsity_boys_ca", scoutlyAthletes: 2 },
  { rank: 10, name: "Torrance HS",            city: "Torrance",          state: "CA", record: "22–7",  division: "D3", source: "seed", type: "varsity_boys_ca", scoutlyAthletes: 1 },
];

const SEED_BOYS_NATIONAL: RankingEntry[] = [
  { rank: 1,  name: "Loyola HS",             city: "Los Angeles",       state: "CA", record: "28–2",  division: "D1", source: "seed", type: "varsity_boys_national", scoutlyAthletes: 4 },
  { rank: 2,  name: "Newport Harbor HS",     city: "Newport Beach",     state: "CA", record: "24–6",  division: "D1", source: "seed", type: "varsity_boys_national", scoutlyAthletes: 3 },
  { rank: 3,  name: "Beverly Hills HS",      city: "Beverly Hills",     state: "CA", record: "26–4",  division: "D1", source: "seed", type: "varsity_boys_national", scoutlyAthletes: 2 },
  { rank: 4,  name: "Archbishop Mitty HS",   city: "San Jose",          state: "CA", record: "27–3",  division: "D1", source: "seed", type: "varsity_boys_national", scoutlyAthletes: null },
  { rank: 5,  name: "Palisades Charter HS",  city: "Pacific Palisades", state: "CA", record: "25–5",  division: "D1", source: "seed", type: "varsity_boys_national", scoutlyAthletes: 3 },
  { rank: 6,  name: "St. Anthony HS",        city: "Long Beach",        state: "CA", record: "22–8",  division: "D1", source: "seed", type: "varsity_boys_national", scoutlyAthletes: 2 },
  { rank: 7,  name: "Elgin HS",              city: "Elgin",             state: "IL", record: "29–4",  division: "D1", source: "seed", type: "varsity_boys_national", scoutlyAthletes: null },
  { rank: 8,  name: "Lehi HS",               city: "Lehi",              state: "UT", record: "28–6",  division: "D1", source: "seed", type: "varsity_boys_national", scoutlyAthletes: null },
  { rank: 9,  name: "Martin Luther King HS", city: "Riverside",         state: "CA", record: "23–7",  division: "D1", source: "seed", type: "varsity_boys_national", scoutlyAthletes: null },
  { rank: 10, name: "Redondo Union HS",      city: "Redondo Beach",     state: "CA", record: "21–9",  division: "D1", source: "seed", type: "varsity_boys_national", scoutlyAthletes: 2 },
];

const SEED_CLUBS_GIRLS_ALL: RankingEntry[] = [
  { rank: 1,  name: "SC Rockstar Volleyball", city: "Manhattan Beach", state: "CA", record: null, division: null, source: "seed", type: "clubs_girls",     scoutlyAthletes: 12 },
  { rank: 2,  name: "A5 Volleyball",           city: "Atlanta",         state: "GA", record: null, division: null, source: "seed", type: "clubs_girls",     scoutlyAthletes: 8 },
  { rank: 3,  name: "TAV",                     city: "Frisco",          state: "TX", record: null, division: null, source: "seed", type: "clubs_girls",     scoutlyAthletes: 10 },
  { rank: 4,  name: "Madfrog Volleyball",      city: "Dallas",          state: "TX", record: null, division: null, source: "seed", type: "clubs_girls",     scoutlyAthletes: 9 },
  { rank: 5,  name: "Mizuno Long Beach",       city: "Long Beach",      state: "CA", record: null, division: null, source: "seed", type: "clubs_girls",     scoutlyAthletes: 7 },
  { rank: 6,  name: "Tstreet Volleyball",      city: "Valencia",        state: "CA", record: null, division: null, source: "seed", type: "clubs_girls",     scoutlyAthletes: 6 },
  { rank: 7,  name: "Coast Volleyball Club",   city: "Newport Beach",   state: "CA", record: null, division: null, source: "seed", type: "clubs_girls",     scoutlyAthletes: 5 },
  { rank: 8,  name: "Arizona Storm",           city: "Gilbert",         state: "AZ", record: null, division: null, source: "seed", type: "clubs_girls",     scoutlyAthletes: 4 },
  { rank: 9,  name: "KC Power Volleyball",     city: "Lenexa",          state: "KS", record: null, division: null, source: "seed", type: "clubs_girls",     scoutlyAthletes: 5 },
  { rank: 10, name: "Legacy Volleyball Club",  city: "Brighton",        state: "MI", record: null, division: null, source: "seed", type: "clubs_girls",     scoutlyAthletes: 3 },
];

const SEED_CLUBS_GIRLS_16U: RankingEntry[] = SEED_CLUBS_GIRLS_ALL.map(e => ({
  ...e,
  type: "clubs_girls_16u",
}));

const SEED_CLUBS_BOYS_16U: RankingEntry[] = [
  { rank: 1,  name: "Long Beach VBC",    city: "Long Beach",    state: "CA", record: null, division: null, source: "seed", type: "clubs_boys_16u", scoutlyAthletes: 14 },
  { rank: 2,  name: "Outrigger VBC",     city: "Honolulu",      state: "HI", record: null, division: null, source: "seed", type: "clubs_boys_16u", scoutlyAthletes: 10 },
  { rank: 3,  name: "Balboa VBC",        city: "Newport Beach", state: "CA", record: null, division: null, source: "seed", type: "clubs_boys_16u", scoutlyAthletes: 11 },
  { rank: 4,  name: "Chicago Frost",     city: "Chicago",       state: "IL", record: null, division: null, source: "seed", type: "clubs_boys_16u", scoutlyAthletes: 8 },
  { rank: 5,  name: "Pacific VBC",       city: "Redondo Beach", state: "CA", record: null, division: null, source: "seed", type: "clubs_boys_16u", scoutlyAthletes: 9 },
  { rank: 6,  name: "Volt Volleyball",   city: "Irvine",        state: "CA", record: null, division: null, source: "seed", type: "clubs_boys_16u", scoutlyAthletes: 7 },
  { rank: 7,  name: "Texas Select",      city: "Dallas",        state: "TX", record: null, division: null, source: "seed", type: "clubs_boys_16u", scoutlyAthletes: 6 },
  { rank: 8,  name: "West Coast Jrs",    city: "Santa Barbara", state: "CA", record: null, division: null, source: "seed", type: "clubs_boys_16u", scoutlyAthletes: 5 },
  { rank: 9,  name: "OC United VBC",     city: "Orange",        state: "CA", record: null, division: null, source: "seed", type: "clubs_boys_16u", scoutlyAthletes: 4 },
  { rank: 10, name: "Desert Elite",      city: "Phoenix",       state: "AZ", record: null, division: null, source: "seed", type: "clubs_boys_16u", scoutlyAthletes: 3 },
];

// ── Compact seed helper ───────────────────────────────────────────

function se(rank: number, name: string, city: string, state: string, type: string): RankingEntry {
  return { rank, name, city, state, record: null, division: null, source: "seed", type, scoutlyAthletes: null };
}

// ── State seed data (fallback per state) ──────────────────────────

const SEED_GIRLS_TX: RankingEntry[] = [
  se(1, "The Woodlands HS", "The Woodlands", "TX", "varsity_girls_tx"),
  se(2, "Katy HS", "Katy", "TX", "varsity_girls_tx"),
  se(3, "Marcus HS", "Flower Mound", "TX", "varsity_girls_tx"),
  se(4, "Allen HS", "Allen", "TX", "varsity_girls_tx"),
  se(5, "Flower Mound HS", "Flower Mound", "TX", "varsity_girls_tx"),
];
const SEED_GIRLS_FL: RankingEntry[] = [
  se(1, "Barron Collier HS", "Naples", "FL", "varsity_girls_fl"),
  se(2, "Jesuit HS", "Tampa", "FL", "varsity_girls_fl"),
  se(3, "Bishop Moore HS", "Orlando", "FL", "varsity_girls_fl"),
  se(4, "Palm Beach Central HS", "Wellington", "FL", "varsity_girls_fl"),
  se(5, "Plant HS", "Tampa", "FL", "varsity_girls_fl"),
];
const SEED_GIRLS_IL: RankingEntry[] = [
  se(1, "Providence Catholic HS", "New Lenox", "IL", "varsity_girls_il"),
  se(2, "Benet Academy", "Lisle", "IL", "varsity_girls_il"),
  se(3, "Neuqua Valley HS", "Naperville", "IL", "varsity_girls_il"),
  se(4, "Libertyville HS", "Libertyville", "IL", "varsity_girls_il"),
  se(5, "New Trier HS", "Winnetka", "IL", "varsity_girls_il"),
];
const SEED_GIRLS_OH: RankingEntry[] = [
  se(1, "Olentangy Liberty HS", "Powell", "OH", "varsity_girls_oh"),
  se(2, "Upper Arlington HS", "Upper Arlington", "OH", "varsity_girls_oh"),
  se(3, "Archbishop Hoban HS", "Akron", "OH", "varsity_girls_oh"),
  se(4, "Ursuline HS", "Youngstown", "OH", "varsity_girls_oh"),
  se(5, "Mason HS", "Mason", "OH", "varsity_girls_oh"),
];
const SEED_GIRLS_MN: RankingEntry[] = [
  se(1, "Wayzata HS", "Plymouth", "MN", "varsity_girls_mn"),
  se(2, "Eagan HS", "Eagan", "MN", "varsity_girls_mn"),
  se(3, "Maple Grove HS", "Maple Grove", "MN", "varsity_girls_mn"),
  se(4, "Minnetonka HS", "Minnetonka", "MN", "varsity_girls_mn"),
  se(5, "Eden Prairie HS", "Eden Prairie", "MN", "varsity_girls_mn"),
];
const SEED_GIRLS_AZ: RankingEntry[] = [
  se(1, "Sandra Day O'Connor HS", "Phoenix", "AZ", "varsity_girls_az"),
  se(2, "Desert Vista HS", "Phoenix", "AZ", "varsity_girls_az"),
  se(3, "Notre Dame Prep", "Scottsdale", "AZ", "varsity_girls_az"),
  se(4, "Red Mountain HS", "Mesa", "AZ", "varsity_girls_az"),
  se(5, "Hamilton HS", "Chandler", "AZ", "varsity_girls_az"),
];
const SEED_GIRLS_WI: RankingEntry[] = [
  se(1, "Kaukauna HS", "Kaukauna", "WI", "varsity_girls_wi"),
  se(2, "Kettle Moraine HS", "Wales", "WI", "varsity_girls_wi"),
  se(3, "Sun Prairie HS", "Sun Prairie", "WI", "varsity_girls_wi"),
  se(4, "Appleton North HS", "Appleton", "WI", "varsity_girls_wi"),
  se(5, "Waunakee HS", "Waunakee", "WI", "varsity_girls_wi"),
];
const SEED_GIRLS_IN: RankingEntry[] = [
  se(1, "Carmel HS", "Carmel", "IN", "varsity_girls_in"),
  se(2, "Westfield HS", "Westfield", "IN", "varsity_girls_in"),
  se(3, "Hamilton Southeastern HS", "Fishers", "IN", "varsity_girls_in"),
  se(4, "Penn HS", "Mishawaka", "IN", "varsity_girls_in"),
  se(5, "North Central HS", "Indianapolis", "IN", "varsity_girls_in"),
];
const SEED_GIRLS_NE: RankingEntry[] = [
  se(1, "Omaha Westside HS", "Omaha", "NE", "varsity_girls_ne"),
  se(2, "Millard West HS", "Omaha", "NE", "varsity_girls_ne"),
  se(3, "Papillion-La Vista South HS", "Papillion", "NE", "varsity_girls_ne"),
  se(4, "Lincoln East HS", "Lincoln", "NE", "varsity_girls_ne"),
  se(5, "Norris HS", "Firth", "NE", "varsity_girls_ne"),
];
const SEED_GIRLS_WA: RankingEntry[] = [
  se(1, "Skyline HS", "Sammamish", "WA", "varsity_girls_wa"),
  se(2, "Eastside Catholic HS", "Sammamish", "WA", "varsity_girls_wa"),
  se(3, "Olympia HS", "Olympia", "WA", "varsity_girls_wa"),
  se(4, "Camas HS", "Camas", "WA", "varsity_girls_wa"),
  se(5, "Emerald Ridge HS", "Puyallup", "WA", "varsity_girls_wa"),
];

const SEED_BOYS_TX: RankingEntry[] = [
  se(1, "Lamar HS", "Houston", "TX", "varsity_boys_tx"),
  se(2, "James Madison HS", "Houston", "TX", "varsity_boys_tx"),
  se(3, "Kingwood Park HS", "Kingwood", "TX", "varsity_boys_tx"),
  se(4, "Seven Lakes HS", "Katy", "TX", "varsity_boys_tx"),
  se(5, "Hays HS", "Buda", "TX", "varsity_boys_tx"),
];
const SEED_BOYS_FL: RankingEntry[] = [
  se(1, "Jesuit HS", "Tampa", "FL", "varsity_boys_fl"),
  se(2, "Bishop Moore HS", "Orlando", "FL", "varsity_boys_fl"),
  se(3, "Clearwater HS", "Clearwater", "FL", "varsity_boys_fl"),
  se(4, "Fort Lauderdale HS", "Fort Lauderdale", "FL", "varsity_boys_fl"),
  se(5, "Plantation HS", "Plantation", "FL", "varsity_boys_fl"),
];
const SEED_BOYS_IL: RankingEntry[] = [
  se(1, "Deerfield HS", "Deerfield", "IL", "varsity_boys_il"),
  se(2, "Lake Zurich HS", "Lake Zurich", "IL", "varsity_boys_il"),
  se(3, "Stevenson HS", "Lincolnshire", "IL", "varsity_boys_il"),
  se(4, "New Trier HS", "Winnetka", "IL", "varsity_boys_il"),
  se(5, "Rolling Meadows HS", "Rolling Meadows", "IL", "varsity_boys_il"),
];
const SEED_BOYS_OH: RankingEntry[] = [
  se(1, "Elder HS", "Cincinnati", "OH", "varsity_boys_oh"),
  se(2, "Pickerington North HS", "Pickerington", "OH", "varsity_boys_oh"),
  se(3, "St. Xavier HS", "Cincinnati", "OH", "varsity_boys_oh"),
  se(4, "Mason HS", "Mason", "OH", "varsity_boys_oh"),
  se(5, "Moeller HS", "Cincinnati", "OH", "varsity_boys_oh"),
];
const SEED_BOYS_HI: RankingEntry[] = [
  se(1, "Punahou School", "Honolulu", "HI", "varsity_boys_hi"),
  se(2, "Iolani School", "Honolulu", "HI", "varsity_boys_hi"),
  se(3, "Moanalua HS", "Honolulu", "HI", "varsity_boys_hi"),
  se(4, "Mililani HS", "Mililani", "HI", "varsity_boys_hi"),
  se(5, "Kamehameha Schools", "Honolulu", "HI", "varsity_boys_hi"),
];
const SEED_BOYS_AZ: RankingEntry[] = [
  se(1, "Corona del Sol HS", "Tempe", "AZ", "varsity_boys_az"),
  se(2, "Perry HS", "Gilbert", "AZ", "varsity_boys_az"),
  se(3, "Desert Ridge HS", "Mesa", "AZ", "varsity_boys_az"),
  se(4, "Horizon HS", "Scottsdale", "AZ", "varsity_boys_az"),
  se(5, "Mesa HS", "Mesa", "AZ", "varsity_boys_az"),
];
const SEED_BOYS_WA: RankingEntry[] = [
  se(1, "Newport HS", "Bellevue", "WA", "varsity_boys_wa"),
  se(2, "Bellarmine Prep", "Tacoma", "WA", "varsity_boys_wa"),
  se(3, "Eastside Catholic HS", "Sammamish", "WA", "varsity_boys_wa"),
  se(4, "Pasco HS", "Pasco", "WA", "varsity_boys_wa"),
  se(5, "Redmond HS", "Redmond", "WA", "varsity_boys_wa"),
];
const SEED_BOYS_IN: RankingEntry[] = [
  se(1, "Cathedral HS", "Indianapolis", "IN", "varsity_boys_in"),
  se(2, "Carmel HS", "Carmel", "IN", "varsity_boys_in"),
  se(3, "Munster HS", "Munster", "IN", "varsity_boys_in"),
  se(4, "South Bend Adams HS", "South Bend", "IN", "varsity_boys_in"),
  se(5, "Columbus North HS", "Columbus", "IN", "varsity_boys_in"),
];
const SEED_BOYS_UT: RankingEntry[] = [
  se(1, "Lehi HS", "Lehi", "UT", "varsity_boys_ut"),
  se(2, "Springville HS", "Springville", "UT", "varsity_boys_ut"),
  se(3, "Lone Peak HS", "Highland", "UT", "varsity_boys_ut"),
  se(4, "Orem HS", "Orem", "UT", "varsity_boys_ut"),
  se(5, "Pleasant Grove HS", "Pleasant Grove", "UT", "varsity_boys_ut"),
];
const SEED_BOYS_CO: RankingEntry[] = [
  se(1, "Columbine HS", "Littleton", "CO", "varsity_boys_co"),
  se(2, "Cherry Creek HS", "Greenwood Village", "CO", "varsity_boys_co"),
  se(3, "Fairview HS", "Boulder", "CO", "varsity_boys_co"),
  se(4, "Rock Canyon HS", "Highlands Ranch", "CO", "varsity_boys_co"),
  se(5, "Loveland HS", "Loveland", "CO", "varsity_boys_co"),
];

// ── Source registry ───────────────────────────────────────────────

const SOURCES = [
  {
    id: "maxpreps_girls_ca",
    label: "MaxPreps Girls CA",
    fn: () => fetchMaxPreps(
      "https://www.maxpreps.com/ca/association/california-interscholastic-federation/volleyball/rankings/1/",
      "varsity_girls_ca",
      "maxpreps"
    ),
  },
  {
    id: "maxpreps_boys_ca",
    label: "MaxPreps Boys CA",
    fn: () => fetchMaxPreps(
      "https://www.maxpreps.com/ca/volleyball/boys/rankings/1/",
      "varsity_boys_ca",
      "maxpreps"
    ),
  },
  {
    id: "maxpreps_girls_national",
    label: "MaxPreps Girls National",
    fn: () => fetchMaxPreps(
      "https://www.maxpreps.com/volleyball/rankings/1/",
      "varsity_girls_national",
      "maxpreps"
    ),
  },
  {
    id: "maxpreps_boys_national",
    label: "MaxPreps Boys National",
    fn: () => fetchMaxPreps(
      "https://www.maxpreps.com/volleyball/boys/rankings/1/",
      "varsity_boys_national",
      "maxpreps"
    ),
  },
  {
    id: "vballrecruiter",
    label: "vballrecruiter",
    fn: () => fetchVballRecruiter(
      "https://vballrecruiter.com/category/club-national-rankings/",
      "clubs_girls",
      "vballrecruiter"
    ),
  },
  {
    id: "aes_girls_16u",
    label: "AES Girls 16U",
    fn: () => fetchAES(
      "https://www.advancedeventsystems.com/rankings/Female/U16/usav",
      "clubs_girls_16u",
      "aes"
    ),
  },
  {
    id: "aes_boys_16u",
    label: "AES Boys 16U",
    fn: () => fetchAES(
      "https://www.advancedeventsystems.com/rankings/Male/U16/usav",
      "clubs_boys_16u",
      "aes"
    ),
  },
  // ── Girls state rankings ─────────────────────────────────────────
  { id: "maxpreps_girls_tx", label: "MaxPreps Girls TX", fn: () => fetchMaxPreps("https://www.maxpreps.com/tx/volleyball/rankings/1/", "varsity_girls_tx", "maxpreps") },
  { id: "maxpreps_girls_fl", label: "MaxPreps Girls FL", fn: () => fetchMaxPreps("https://www.maxpreps.com/fl/volleyball/rankings/1/", "varsity_girls_fl", "maxpreps") },
  { id: "maxpreps_girls_il", label: "MaxPreps Girls IL", fn: () => fetchMaxPreps("https://www.maxpreps.com/il/volleyball/rankings/1/", "varsity_girls_il", "maxpreps") },
  { id: "maxpreps_girls_oh", label: "MaxPreps Girls OH", fn: () => fetchMaxPreps("https://www.maxpreps.com/oh/volleyball/rankings/1/", "varsity_girls_oh", "maxpreps") },
  { id: "maxpreps_girls_mn", label: "MaxPreps Girls MN", fn: () => fetchMaxPreps("https://www.maxpreps.com/mn/volleyball/rankings/1/", "varsity_girls_mn", "maxpreps") },
  { id: "maxpreps_girls_az", label: "MaxPreps Girls AZ", fn: () => fetchMaxPreps("https://www.maxpreps.com/az/volleyball/rankings/1/", "varsity_girls_az", "maxpreps") },
  { id: "maxpreps_girls_wi", label: "MaxPreps Girls WI", fn: () => fetchMaxPreps("https://www.maxpreps.com/wi/volleyball/rankings/1/", "varsity_girls_wi", "maxpreps") },
  { id: "maxpreps_girls_in", label: "MaxPreps Girls IN", fn: () => fetchMaxPreps("https://www.maxpreps.com/in/volleyball/rankings/1/", "varsity_girls_in", "maxpreps") },
  { id: "maxpreps_girls_ne", label: "MaxPreps Girls NE", fn: () => fetchMaxPreps("https://www.maxpreps.com/ne/volleyball/rankings/1/", "varsity_girls_ne", "maxpreps") },
  { id: "maxpreps_girls_wa", label: "MaxPreps Girls WA", fn: () => fetchMaxPreps("https://www.maxpreps.com/wa/volleyball/rankings/1/", "varsity_girls_wa", "maxpreps") },
  // ── Boys state rankings ──────────────────────────────────────────
  { id: "maxpreps_boys_tx", label: "MaxPreps Boys TX", fn: () => fetchMaxPreps("https://www.maxpreps.com/tx/volleyball/boys/rankings/1/", "varsity_boys_tx", "maxpreps") },
  { id: "maxpreps_boys_fl", label: "MaxPreps Boys FL", fn: () => fetchMaxPreps("https://www.maxpreps.com/fl/volleyball/boys/rankings/1/", "varsity_boys_fl", "maxpreps") },
  { id: "maxpreps_boys_il", label: "MaxPreps Boys IL", fn: () => fetchMaxPreps("https://www.maxpreps.com/il/volleyball/boys/rankings/1/", "varsity_boys_il", "maxpreps") },
  { id: "maxpreps_boys_oh", label: "MaxPreps Boys OH", fn: () => fetchMaxPreps("https://www.maxpreps.com/oh/volleyball/boys/rankings/1/", "varsity_boys_oh", "maxpreps") },
  { id: "maxpreps_boys_hi", label: "MaxPreps Boys HI", fn: () => fetchMaxPreps("https://www.maxpreps.com/hi/volleyball/boys/rankings/1/", "varsity_boys_hi", "maxpreps") },
  { id: "maxpreps_boys_az", label: "MaxPreps Boys AZ", fn: () => fetchMaxPreps("https://www.maxpreps.com/az/volleyball/boys/rankings/1/", "varsity_boys_az", "maxpreps") },
  { id: "maxpreps_boys_wa", label: "MaxPreps Boys WA", fn: () => fetchMaxPreps("https://www.maxpreps.com/wa/volleyball/boys/rankings/1/", "varsity_boys_wa", "maxpreps") },
  { id: "maxpreps_boys_in", label: "MaxPreps Boys IN", fn: () => fetchMaxPreps("https://www.maxpreps.com/in/volleyball/boys/rankings/1/", "varsity_boys_in", "maxpreps") },
  { id: "maxpreps_boys_ut", label: "MaxPreps Boys UT", fn: () => fetchMaxPreps("https://www.maxpreps.com/ut/volleyball/boys/rankings/1/", "varsity_boys_ut", "maxpreps") },
  { id: "maxpreps_boys_co", label: "MaxPreps Boys CO", fn: () => fetchMaxPreps("https://www.maxpreps.com/co/volleyball/boys/rankings/1/", "varsity_boys_co", "maxpreps") },
];

// ── Module-level cache ────────────────────────────────────────────

let cachedData: unknown = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// ── Route handler ─────────────────────────────────────────────────

export async function GET() {
  if (cachedData && Date.now() - cacheTime < CACHE_DURATION) {
    return NextResponse.json(cachedData);
  }

  const timestamp = new Date().toISOString();

  const results = await Promise.allSettled(SOURCES.map((s) => s.fn()));

  const succeeded: string[] = [];
  const failed: string[] = [];
  const dataMap: Record<string, RankingEntry[]> = {};
  const lastUpdatedMap: Record<string, string> = {};

  results.forEach((result, i) => {
    const src = SOURCES[i];
    if (result.status === "fulfilled" && result.value.data.length > 0) {
      succeeded.push(src.id);
      dataMap[src.id] = result.value.data;
      if (result.value.lastUpdated) lastUpdatedMap[src.id] = result.value.lastUpdated;
    } else {
      failed.push(src.id);
      const reason =
        result.status === "rejected"
          ? (result.reason as Error)?.message ?? "unknown error"
          : "empty response";
      console.error(`Rankings API: ${src.label} failed — ${reason}`);
    }
  });

  console.log(
    `Rankings API: ${succeeded.length} sources succeeded, ${failed.length} failed. Timestamp: ${timestamp}`
  );

  function get(
    id: string,
    seed: RankingEntry[]
  ): { data: RankingEntry[]; fromCache: boolean } {
    if (dataMap[id]) return { data: dataMap[id], fromCache: false };
    return { data: seed, fromCache: true };
  }

  const girlsCA       = get("maxpreps_girls_ca",       SEED_GIRLS_CA);
  const girlsNational = get("maxpreps_girls_national", SEED_GIRLS_NATIONAL);
  const boysCA        = get("maxpreps_boys_ca",        SEED_BOYS_CA);
  const boysNational  = get("maxpreps_boys_national",  SEED_BOYS_NATIONAL);
  const clubsGirls    = get("vballrecruiter",          SEED_CLUBS_GIRLS_ALL);
  const clubsGirls16u = get("aes_girls_16u",           SEED_CLUBS_GIRLS_16U);
  const clubsBoys16u  = get("aes_boys_16u",            SEED_CLUBS_BOYS_16U);
  // Girls states
  const girlsTX = get("maxpreps_girls_tx", SEED_GIRLS_TX);
  const girlsFL = get("maxpreps_girls_fl", SEED_GIRLS_FL);
  const girlsIL = get("maxpreps_girls_il", SEED_GIRLS_IL);
  const girlsOH = get("maxpreps_girls_oh", SEED_GIRLS_OH);
  const girlsMN = get("maxpreps_girls_mn", SEED_GIRLS_MN);
  const girlsAZ = get("maxpreps_girls_az", SEED_GIRLS_AZ);
  const girlsWI = get("maxpreps_girls_wi", SEED_GIRLS_WI);
  const girlsIN = get("maxpreps_girls_in", SEED_GIRLS_IN);
  const girlsNE = get("maxpreps_girls_ne", SEED_GIRLS_NE);
  const girlsWA = get("maxpreps_girls_wa", SEED_GIRLS_WA);
  // Boys states
  const boysTX = get("maxpreps_boys_tx", SEED_BOYS_TX);
  const boysFL = get("maxpreps_boys_fl", SEED_BOYS_FL);
  const boysIL = get("maxpreps_boys_il", SEED_BOYS_IL);
  const boysOH = get("maxpreps_boys_oh", SEED_BOYS_OH);
  const boysHI = get("maxpreps_boys_hi", SEED_BOYS_HI);
  const boysAZ = get("maxpreps_boys_az", SEED_BOYS_AZ);
  const boysWA = get("maxpreps_boys_wa", SEED_BOYS_WA);
  const boysIN = get("maxpreps_boys_in", SEED_BOYS_IN);
  const boysUT = get("maxpreps_boys_ut", SEED_BOYS_UT);
  const boysCO = get("maxpreps_boys_co", SEED_BOYS_CO);

  const allFailed = succeeded.length === 0;

  const result = {
    fallback: allFailed,
    varsity: {
      girls: {
        ca:       { data: girlsCA.data,       fromCache: girlsCA.fromCache },
        national: { data: girlsNational.data, fromCache: girlsNational.fromCache },
        tx:       { data: girlsTX.data,       fromCache: girlsTX.fromCache },
        fl:       { data: girlsFL.data,       fromCache: girlsFL.fromCache },
        il:       { data: girlsIL.data,       fromCache: girlsIL.fromCache },
        oh:       { data: girlsOH.data,       fromCache: girlsOH.fromCache },
        mn:       { data: girlsMN.data,       fromCache: girlsMN.fromCache },
        az:       { data: girlsAZ.data,       fromCache: girlsAZ.fromCache },
        wi:       { data: girlsWI.data,       fromCache: girlsWI.fromCache },
        in:       { data: girlsIN.data,       fromCache: girlsIN.fromCache },
        ne:       { data: girlsNE.data,       fromCache: girlsNE.fromCache },
        wa:       { data: girlsWA.data,       fromCache: girlsWA.fromCache },
      },
      boys: {
        ca:       { data: boysCA.data,       fromCache: boysCA.fromCache },
        national: { data: boysNational.data, fromCache: boysNational.fromCache },
        tx:       { data: boysTX.data,       fromCache: boysTX.fromCache },
        fl:       { data: boysFL.data,       fromCache: boysFL.fromCache },
        il:       { data: boysIL.data,       fromCache: boysIL.fromCache },
        oh:       { data: boysOH.data,       fromCache: boysOH.fromCache },
        hi:       { data: boysHI.data,       fromCache: boysHI.fromCache },
        az:       { data: boysAZ.data,       fromCache: boysAZ.fromCache },
        wa:       { data: boysWA.data,       fromCache: boysWA.fromCache },
        in:       { data: boysIN.data,       fromCache: boysIN.fromCache },
        ut:       { data: boysUT.data,       fromCache: boysUT.fromCache },
        co:       { data: boysCO.data,       fromCache: boysCO.fromCache },
      },
    },
    clubs: {
      girls: {
        u16: { data: clubsGirls16u.data, fromCache: clubsGirls16u.fromCache },
        all: { data: clubsGirls.data,    fromCache: clubsGirls.fromCache },
      },
      boys: {
        u16: { data: clubsBoys16u.data, fromCache: clubsBoys16u.fromCache },
      },
    },
    sources: {
      succeeded,
      failed,
      timestamp,
      lastUpdated: lastUpdatedMap,
    },
  };

  cachedData = result;
  cacheTime = Date.now();

  return NextResponse.json(result);
}
