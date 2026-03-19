"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

type RankingsTab = "clubs" | "hs" | "jv";
type Movement = "up" | "down" | "same" | "new";

// ── Live data types (from /api/rankings) ──────────────────────────

interface RankingEntry {
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

interface LiveSection {
  data: RankingEntry[];
  fromCache: boolean;
}

interface LiveData {
  fallback: boolean;
  varsity: {
    girls: Record<string, LiveSection>;
    boys:  Record<string, LiveSection>;
  };
  clubs: {
    girls: { u16: LiveSection; all: LiveSection };
    boys:  { u16: LiveSection };
  };
  sources: {
    succeeded: string[];
    failed: string[];
    timestamp: string;
    lastUpdated: Record<string, string> | null;
  };
}

// ── Types ──────────────────────────────────────────────────────────

interface Club {
  rank: number;
  name: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  location: string;
  score: number;
  move: Movement;
  moveAmt?: number;
  isMyClub?: boolean;
  athletes: number;
  d1Commits: number;
  topAthlete: string;
}

interface VarsitySchool {
  rank: number;
  name: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  location: string;
  division: string;
  record: string;
  move: Movement;
  moveAmt?: number;
  isMySchool?: boolean;
  cifFinish: string;
  headCoach: string;
}

// ── Clubs seed data ────────────────────────────────────────────────

const CLUBS: Club[] = [
  { rank: 1,  name: "SC Rockstar Volleyball",      initials: "SR", avatarBg: "#1A6B3C", avatarColor: "white",   location: "Manhattan Beach CA",  score: 96.4, move: "up",   moveAmt: 2, isMyClub: true, athletes: 12, d1Commits: 3, topAthlete: "Sofia Reyes · OH" },
  { rank: 2,  name: "A5 Volleyball",               initials: "A5", avatarBg: "#185FA5", avatarColor: "white",   location: "Atlanta GA",          score: 94.8, move: "new",              athletes: 8,  d1Commits: 2, topAthlete: "Brooke Anderson · OH" },
  { rank: 3,  name: "TAV",                         initials: "TV", avatarBg: "#534AB7", avatarColor: "white",   location: "Frisco TX",           score: 93.2, move: "down", moveAmt: 1, athletes: 10, d1Commits: 2, topAthlete: "Maya Chen · Setter" },
  { rank: 4,  name: "Madfrog Volleyball",          initials: "MF", avatarBg: "#C13584", avatarColor: "white",   location: "Dallas TX",           score: 91.7, move: "up",   moveAmt: 1, athletes: 9,  d1Commits: 1, topAthlete: "Olivia Martinez · Setter" },
  { rank: 5,  name: "Mizuno Long Beach",           initials: "ML", avatarBg: "#D4B800", avatarColor: "#1a1a00", location: "Long Beach CA",       score: 90.3, move: "same",             athletes: 7,  d1Commits: 4, topAthlete: "Jade Thompson · OH" },
  { rank: 6,  name: "Tstreet Volleyball",          initials: "TS", avatarBg: "#e24b4a", avatarColor: "white",   location: "Valencia CA",         score: 89.8, move: "up",   moveAmt: 3, athletes: 6,  d1Commits: 2, topAthlete: "Riley Williams · OH" },
  { rank: 7,  name: "Coast Volleyball Club",       initials: "CV", avatarBg: "#0C447C", avatarColor: "white",   location: "Newport Beach CA",    score: 88.4, move: "down", moveAmt: 2, athletes: 5,  d1Commits: 1, topAthlete: "Casey Martinez · OH" },
  { rank: 8,  name: "Arizona Storm",               initials: "AZ", avatarBg: "#2D9A5A", avatarColor: "white",   location: "Gilbert AZ",          score: 87.9, move: "new",              athletes: 4,  d1Commits: 0, topAthlete: "Lindsay Hoffman · Setter" },
  { rank: 9,  name: "KC Power Volleyball",         initials: "KC", avatarBg: "#633806", avatarColor: "white",   location: "Lenexa KS",           score: 86.3, move: "up",   moveAmt: 1, athletes: 5,  d1Commits: 1, topAthlete: "Sarah Mueller · MB" },
  { rank: 10, name: "Legacy Volleyball Club",      initials: "LV", avatarBg: "#3C3489", avatarColor: "white",   location: "Brighton MI",         score: 85.1, move: "down", moveAmt: 1, athletes: 3,  d1Commits: 1, topAthlete: "Chelsea Wong · Setter" },
  { rank: 11, name: "SCVC",                        initials: "SC", avatarBg: "#8B1A1A", avatarColor: "white",   location: "Valencia CA",         score: 84.2, move: "up",   moveAmt: 1, athletes: 6,  d1Commits: 2, topAthlete: "Avery Collins · OH" },
  { rank: 12, name: "Houston Juniors VBC",         initials: "HJ", avatarBg: "#185FA5", avatarColor: "white",   location: "Houston TX",          score: 83.4, move: "same",             athletes: 5,  d1Commits: 1, topAthlete: "Grace Nguyen · Setter" },
  { rank: 13, name: "Munciana Volleyball",         initials: "MU", avatarBg: "#534AB7", avatarColor: "white",   location: "Muncie IN",           score: 82.6, move: "down", moveAmt: 1, athletes: 4,  d1Commits: 1, topAthlete: "Emma Schultz · MB" },
  { rank: 14, name: "Club V Volleyball",           initials: "CV", avatarBg: "#0C447C", avatarColor: "white",   location: "Gahanna OH",          score: 81.9, move: "up",   moveAmt: 2, athletes: 5,  d1Commits: 1, topAthlete: "Jordan Reed · OH" },
  { rank: 15, name: "Skyline Empire VBC",          initials: "SE", avatarBg: "#2D9A5A", avatarColor: "white",   location: "Sacramento CA",       score: 81.1, move: "new",              athletes: 4,  d1Commits: 0, topAthlete: "Priya Sandhu · Libero" },
  { rank: 16, name: "Minnesota Select VBC",        initials: "MS", avatarBg: "#C13584", avatarColor: "white",   location: "Eden Prairie MN",     score: 80.4, move: "down", moveAmt: 1, athletes: 3,  d1Commits: 1, topAthlete: "Hannah Peterson · OH" },
  { rank: 17, name: "Northern Lights VBC",         initials: "NL", avatarBg: "#633806", avatarColor: "white",   location: "Minneapolis MN",      score: 79.7, move: "same",             athletes: 4,  d1Commits: 0, topAthlete: "Claire Olson · DS" },
  { rank: 18, name: "Triangle Volleyball Club",    initials: "TR", avatarBg: "#3C3489", avatarColor: "white",   location: "Raleigh NC",          score: 79.0, move: "up",   moveAmt: 1, athletes: 3,  d1Commits: 1, topAthlete: "Amara Jones · OH" },
  { rank: 19, name: "NKYVC",                       initials: "NK", avatarBg: "#1A6B3C", avatarColor: "white",   location: "Florence KY",         score: 78.3, move: "down", moveAmt: 2, athletes: 4,  d1Commits: 0, topAthlete: "Lexi Barnett · MB" },
  { rank: 20, name: "Heartland VBC",               initials: "HV", avatarBg: "#D4B800", avatarColor: "#1a1a00", location: "Kansas City MO",      score: 77.6, move: "same",             athletes: 3,  d1Commits: 0, topAthlete: "Bree Wallace · Setter" },
  { rank: 21, name: "Pacific Northwest VBC",       initials: "PN", avatarBg: "#185FA5", avatarColor: "white",   location: "Bellevue WA",         score: 76.9, move: "up",   moveAmt: 1, athletes: 3,  d1Commits: 0, topAthlete: "Sierra Yamamoto · OH" },
  { rank: 22, name: "Stars Volleyball",            initials: "SV", avatarBg: "#e24b4a", avatarColor: "white",   location: "Denver CO",           score: 76.2, move: "new",              athletes: 4,  d1Commits: 1, topAthlete: "Maddie Cruz · OH" },
  { rank: 23, name: "Atlanta Volleyball Academy",  initials: "AV", avatarBg: "#534AB7", avatarColor: "white",   location: "Marietta GA",         score: 75.5, move: "down", moveAmt: 1, athletes: 3,  d1Commits: 0, topAthlete: "Tamara Boyd · MB" },
  { rank: 24, name: "Ohio Valley Elite",           initials: "OV", avatarBg: "#2D9A5A", avatarColor: "white",   location: "Cincinnati OH",       score: 74.8, move: "same",             athletes: 2,  d1Commits: 0, topAthlete: "Nina Hooper · Setter" },
  { rank: 25, name: "New Mexico Impact",           initials: "NM", avatarBg: "#8B1A1A", avatarColor: "white",   location: "Albuquerque NM",      score: 74.1, move: "up",   moveAmt: 1, athletes: 2,  d1Commits: 0, topAthlete: "Lucia Chavez · OH" },
];

const BOYS_CLUBS: Club[] = [
  { rank: 1,  name: "Long Beach VBC",          initials: "LB", avatarBg: "#0C447C", avatarColor: "white",   location: "Long Beach CA",    score: 95.2, move: "up",   moveAmt: 1, athletes: 14, d1Commits: 5, topAthlete: "Kai Nguyen · OH" },
  { rank: 2,  name: "Outrigger VBC",           initials: "OT", avatarBg: "#185FA5", avatarColor: "white",   location: "Honolulu HI",      score: 93.8, move: "same",             athletes: 11, d1Commits: 3, topAthlete: "Makoa Kealoha · S" },
  { rank: 3,  name: "Balboa Volleyball Club",  initials: "BV", avatarBg: "#534AB7", avatarColor: "white",   location: "San Diego CA",     score: 92.1, move: "down", moveAmt: 1, athletes: 9,  d1Commits: 2, topAthlete: "Eric Torres · MB" },
  { rank: 4,  name: "Chicago Frost VBC",       initials: "CF", avatarBg: "#2D9A5A", avatarColor: "white",   location: "Chicago IL",       score: 90.7, move: "new",              athletes: 8,  d1Commits: 2, topAthlete: "Jordan Hayes · OH" },
  { rank: 5,  name: "Maverick Volleyball",     initials: "MV", avatarBg: "#C13584", avatarColor: "white",   location: "Dallas TX",        score: 89.4, move: "up",   moveAmt: 2, athletes: 7,  d1Commits: 1, topAthlete: "Marcus Webb · S" },
  { rank: 6,  name: "Bay United VBC",          initials: "BU", avatarBg: "#633806", avatarColor: "white",   location: "San Jose CA",      score: 88.0, move: "down", moveAmt: 1, athletes: 6,  d1Commits: 2, topAthlete: "Alex Park · Libero" },
  { rank: 7,  name: "Volt Volleyball",         initials: "VV", avatarBg: "#D4B800", avatarColor: "#1a1a00", location: "Irvine CA",        score: 86.8, move: "up",   moveAmt: 1, athletes: 8,  d1Commits: 1, topAthlete: "Ryan Kim · OH" },
  { rank: 8,  name: "Gateway VBC",             initials: "GW", avatarBg: "#3C3489", avatarColor: "white",   location: "St. Louis MO",     score: 85.3, move: "same",             athletes: 5,  d1Commits: 0, topAthlete: "Tyler Grant · MB" },
  { rank: 9,  name: "EVO Volleyball",          initials: "EV", avatarBg: "#e24b4a", avatarColor: "white",   location: "Norcross GA",      score: 84.1, move: "down", moveAmt: 2, athletes: 4,  d1Commits: 1, topAthlete: "Devon Harris · S" },
  { rank: 10, name: "Pacific VBC",             initials: "PV", avatarBg: "#8B1A1A", avatarColor: "white",   location: "Redondo Beach CA", score: 83.0, move: "up",   moveAmt: 1, athletes: 6,  d1Commits: 0, topAthlete: "Shane Lopez · OH" },
  { rank: 11, name: "Los Angeles VBC",         initials: "LA", avatarBg: "#185FA5", avatarColor: "white",   location: "Los Angeles CA",   score: 82.0, move: "same",             athletes: 7,  d1Commits: 1, topAthlete: "Zach Moore · OH" },
  { rank: 12, name: "808 VBC",                 initials: "88", avatarBg: "#1A6B3C", avatarColor: "white",   location: "Honolulu HI",      score: 81.1, move: "down", moveAmt: 1, athletes: 5,  d1Commits: 1, topAthlete: "Koa Akana · MB" },
  { rank: 13, name: "Pacific Rim VBC",         initials: "PR", avatarBg: "#534AB7", avatarColor: "white",   location: "Bellevue WA",      score: 80.2, move: "up",   moveAmt: 2, athletes: 6,  d1Commits: 0, topAthlete: "Theo Matsuda · S" },
  { rank: 14, name: "Greater Heights VBC",     initials: "GH", avatarBg: "#0C447C", avatarColor: "white",   location: "Houston TX",       score: 79.3, move: "new",              athletes: 5,  d1Commits: 1, topAthlete: "Marcus Bell · OH" },
  { rank: 15, name: "Texas Tornados VBC",      initials: "TT", avatarBg: "#C13584", avatarColor: "white",   location: "Plano TX",         score: 78.4, move: "down", moveAmt: 1, athletes: 4,  d1Commits: 0, topAthlete: "Cole Tran · Libero" },
  { rank: 16, name: "Bay Rockets VBC",         initials: "BR", avatarBg: "#2D9A5A", avatarColor: "white",   location: "Oakland CA",       score: 77.6, move: "same",             athletes: 4,  d1Commits: 0, topAthlete: "Noah Obi · S" },
  { rank: 17, name: "Mid-Atlantic VBC",        initials: "MA", avatarBg: "#633806", avatarColor: "white",   location: "Philadelphia PA",  score: 76.8, move: "up",   moveAmt: 1, athletes: 3,  d1Commits: 1, topAthlete: "Dominic Cruz · OH" },
  { rank: 18, name: "NOVA Volleyball",         initials: "NV", avatarBg: "#3C3489", avatarColor: "white",   location: "Fairfax VA",       score: 75.9, move: "down", moveAmt: 2, athletes: 4,  d1Commits: 0, topAthlete: "James Li · MB" },
  { rank: 19, name: "Rocky Mountain VBC",      initials: "RM", avatarBg: "#D4B800", avatarColor: "#1a1a00", location: "Denver CO",        score: 75.1, move: "same",             athletes: 3,  d1Commits: 0, topAthlete: "Brett Solano · S" },
  { rank: 20, name: "Sunshine State VBC",      initials: "SS", avatarBg: "#185FA5", avatarColor: "white",   location: "Orlando FL",       score: 74.2, move: "up",   moveAmt: 1, athletes: 3,  d1Commits: 0, topAthlete: "Evan Williams · OH" },
  { rank: 21, name: "East Coast VBC",          initials: "EC", avatarBg: "#e24b4a", avatarColor: "white",   location: "Princeton NJ",     score: 73.4, move: "new",              athletes: 4,  d1Commits: 0, topAthlete: "Tyler Fox · DS" },
  { rank: 22, name: "Northwest VBC",           initials: "NW", avatarBg: "#8B1A1A", avatarColor: "white",   location: "Portland OR",      score: 72.6, move: "down", moveAmt: 1, athletes: 3,  d1Commits: 0, topAthlete: "Sam Patel · OH" },
  { rank: 23, name: "Mountain West VBC",       initials: "MW", avatarBg: "#534AB7", avatarColor: "white",   location: "Salt Lake City UT", score: 71.8, move: "same",            athletes: 3,  d1Commits: 0, topAthlete: "Drew Hansen · MB" },
  { rank: 24, name: "Great Lakes VBC",         initials: "GL", avatarBg: "#2D9A5A", avatarColor: "white",   location: "Columbus OH",      score: 71.0, move: "up",   moveAmt: 1, athletes: 2,  d1Commits: 0, topAthlete: "Lucas Martin · S" },
  { rank: 25, name: "Southeast VBC",           initials: "SE", avatarBg: "#1A6B3C", avatarColor: "white",   location: "Charlotte NC",     score: 70.2, move: "down", moveAmt: 1, athletes: 2,  d1Commits: 0, topAthlete: "Connor Webb · OH" },
];

// ── Varsity seed data ──────────────────────────────────────────────

const GIRLS_CIF_SOUTHERN: VarsitySchool[] = [
  { rank: 1,  name: "Mira Costa HS",       initials: "MC", avatarBg: "#1A6B3C", avatarColor: "white", location: "Manhattan Beach CA",    division: "D1", record: "32–4",  move: "up",   moveAmt: 1, isMySchool: true, cifFinish: "Semifinals",    headCoach: "Dave Mohs" },
  { rank: 2,  name: "Marymount HS",         initials: "MH", avatarBg: "#8B1A1A", avatarColor: "white", location: "Los Angeles CA",        division: "D1", record: "30–2",  move: "same",             cifFinish: "Runner-up",     headCoach: "Chris Richard" },
  { rank: 3,  name: "Redondo Union HS",     initials: "RU", avatarBg: "#0C447C", avatarColor: "white", location: "Redondo Beach CA",      division: "D1", record: "28–5",  move: "up",   moveAmt: 2, cifFinish: "Finals",        headCoach: "Todd Burnett" },
  { rank: 4,  name: "Palos Verdes HS",      initials: "PV", avatarBg: "#534AB7", avatarColor: "white", location: "Palos Verdes CA",       division: "D1", record: "26–7",  move: "down", moveAmt: 1, cifFinish: "Quarterfinals", headCoach: "Jim Millhouse" },
  { rank: 5,  name: "Corona del Mar HS",    initials: "CM", avatarBg: "#185FA5", avatarColor: "white", location: "Newport Beach CA",      division: "D1", record: "25–8",  move: "new",              cifFinish: "Semifinals",    headCoach: "Jordan Vander" },
  { rank: 6,  name: "Mater Dei HS",         initials: "MD", avatarBg: "#633806", avatarColor: "white", location: "Santa Ana CA",          division: "D1", record: "27–6",  move: "up",   moveAmt: 1, cifFinish: "Quarterfinals", headCoach: "Shannon Braby" },
  { rank: 7,  name: "Sierra Canyon HS",     initials: "SC", avatarBg: "#2D9A5A", avatarColor: "white", location: "Chatsworth CA",         division: "D2", record: "24–7",  move: "down", moveAmt: 2, cifFinish: "Semifinals",    headCoach: "Scott Bokar" },
  { rank: 8,  name: "Oaks Christian HS",    initials: "OC", avatarBg: "#C13584", avatarColor: "white", location: "Westlake Village CA",   division: "D2", record: "22–9",  move: "up",   moveAmt: 1, cifFinish: "Quarterfinals", headCoach: "Beth Jordan" },
  { rank: 9,  name: "Viewpoint HS",         initials: "VP", avatarBg: "#3C3489", avatarColor: "white", location: "Calabasas CA",          division: "D2", record: "21–10", move: "same",             cifFinish: "Round of 16",   headCoach: "Lori Powers" },
  { rank: 10, name: "Bishop Montgomery HS", initials: "BM", avatarBg: "#e24b4a", avatarColor: "white", location: "Torrance CA",           division: "D2", record: "20–11", move: "down", moveAmt: 1, cifFinish: "Round of 16",   headCoach: "Sue Kim" },
];

const BOYS_CIF_SOUTHERN: VarsitySchool[] = [
  { rank: 1,  name: "Loyola HS",          initials: "LY", avatarBg: "#8B1A1A", avatarColor: "white", location: "Los Angeles CA",           division: "D1", record: "26–2",  move: "up",   moveAmt: 2, cifFinish: "Champion",      headCoach: "Tom Pestolesi" },
  { rank: 2,  name: "Palisades HS",       initials: "PA", avatarBg: "#0C447C", avatarColor: "white", location: "Pacific Palisades CA",     division: "D1", record: "24–5",  move: "same",             cifFinish: "Runner-up",     headCoach: "Mark Rosen" },
  { rank: 3,  name: "Beverly Hills HS",   initials: "BH", avatarBg: "#534AB7", avatarColor: "white", location: "Beverly Hills CA",         division: "D1", record: "23–6",  move: "down", moveAmt: 1, cifFinish: "Semifinals",    headCoach: "Russ May" },
  { rank: 4,  name: "Mira Costa HS",      initials: "MC", avatarBg: "#1A6B3C", avatarColor: "white", location: "Manhattan Beach CA",       division: "D2", record: "22–7",  move: "up",   moveAmt: 1, isMySchool: true, cifFinish: "Semifinals",    headCoach: "Dave Mohs" },
  { rank: 5,  name: "Santa Monica HS",    initials: "SM", avatarBg: "#185FA5", avatarColor: "white", location: "Santa Monica CA",          division: "D1", record: "21–8",  move: "new",              cifFinish: "Quarterfinals", headCoach: "Joe Stone" },
  { rank: 6,  name: "Redondo Union HS",   initials: "RU", avatarBg: "#2D9A5A", avatarColor: "white", location: "Redondo Beach CA",         division: "D1", record: "20–9",  move: "down", moveAmt: 2, cifFinish: "Quarterfinals", headCoach: "Jon Romo" },
  { rank: 7,  name: "El Segundo HS",      initials: "ES", avatarBg: "#633806", avatarColor: "white", location: "El Segundo CA",            division: "D2", record: "23–6",  move: "up",   moveAmt: 3, cifFinish: "Semifinals",    headCoach: "Rick Mesa" },
  { rank: 8,  name: "Torrance HS",        initials: "TH", avatarBg: "#C13584", avatarColor: "white", location: "Torrance CA",              division: "D2", record: "19–10", move: "same",             cifFinish: "Round of 16",   headCoach: "Mark Allen" },
  { rank: 9,  name: "Palos Verdes HS",    initials: "PV", avatarBg: "#3C3489", avatarColor: "white", location: "Palos Verdes CA",          division: "D2", record: "18–11", move: "up",   moveAmt: 1, cifFinish: "Quarterfinals", headCoach: "Chris Walker" },
  { rank: 10, name: "Peninsula HS",       initials: "PE", avatarBg: "#D4B800", avatarColor: "#1a1a00", location: "Rolling Hills Estates CA", division: "D2", record: "17–12", move: "down", moveAmt: 1, cifFinish: "Round of 16",   headCoach: "Tom Davis" },
];

// ── Varsity movement seed map (applied to scraped data by school name) ──

const VARSITY_MOVEMENT_MAP: Record<string, { move: Movement; moveAmt?: number }> = {
  "mater dei":           { move: "same" },
  "sierra canyon":       { move: "up",   moveAmt: 1 },
  "torrey pines":        { move: "down", moveAmt: 1 },
  "archbishop mitty":    { move: "up",   moveAmt: 2 },
  "harvard-westlake":    { move: "new" },
  "marymount":           { move: "down", moveAmt: 1 },
  "santa margarita":     { move: "up",   moveAmt: 1 },
  "rocklin":             { move: "down", moveAmt: 2 },
  "cathedral catholic":  { move: "same" },
  "redondo union":       { move: "up",   moveAmt: 1 },
  "mira costa":          { move: "down", moveAmt: 1 },
  "west ranch":          { move: "up",   moveAmt: 2 },
  "cypress":             { move: "new" },
  "san juan hills":      { move: "same" },
  "branson":             { move: "up",   moveAmt: 1 },
};

function getVarsityMovement(name: string): { move: Movement; moveAmt?: number } {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(VARSITY_MOVEMENT_MAP)) {
    if (lower.includes(key)) return val;
  }
  return { move: "same" };
}

// Returns null if record is null/missing.
// Returns "—" if wins < losses and rank ≤ 15 (suspicious for a top-15 team).
// Otherwise returns the record as-is.
function safeRecord(record: string | null, rank: number): string | null {
  if (!record) return null;
  const m = record.match(/(\d+)[–\-](\d+)/);
  if (m && rank <= 15) {
    const w = parseInt(m[1]);
    const l = parseInt(m[2]);
    if (w < l) return "—";
  }
  return record;
}

// ── Helpers ────────────────────────────────────────────────────────

function rankStyle(rank: number): React.CSSProperties {
  if (rank === 1) return { color: "#D4AF37", fontSize: 20, fontWeight: 700 };
  if (rank === 2) return { color: "#A8A9AD", fontSize: 18, fontWeight: 700 };
  if (rank === 3) return { color: "#CD7F32", fontSize: 18, fontWeight: 700 };
  if (rank <= 10) return { color: "#bbb",    fontSize: 16, fontWeight: 700 };
  return              { color: "#ccc",    fontSize: 14, fontWeight: 700 };
}

function MoveBadge({ move, amt }: { move: Movement; amt?: number }) {
  if (move === "new") return (
    <span style={{ background: "#E8F5EE", color: "#0F4A28", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "1px 4px" }}>NEW</span>
  );
  if (move === "up")   return <span style={{ color: "#2D9A5A", fontSize: 10, fontWeight: 700 }}>↑{amt}</span>;
  if (move === "down") return <span style={{ color: "#e24b4a", fontSize: 10, fontWeight: 700 }}>↓{amt}</span>;
  return <span style={{ color: "#ccc", fontSize: 10 }}>—</span>;
}

function Avatar({ initials, bg, color, size = 40 }: { initials: string; bg: string; color: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      color, fontWeight: 800, fontSize: size < 44 ? 12 : 14,
    }}>
      {initials}
    </div>
  );
}

// ── Shimmer skeleton ──────────────────────────────────────────────

const SHIMMER_CSS = `@keyframes scoutly-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}`;

function ShimmerRows() {
  return (
    <>
      <style>{SHIMMER_CSS}</style>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            height: 52, borderRadius: 8, margin: "4px 0",
            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "scoutly-shimmer 1.5s infinite",
          }}
        />
      ))}
    </>
  );
}

// ── Scraped row renderers ─────────────────────────────────────────

function sourceLabel(src: string): string {
  if (src === "maxpreps") return "MaxPreps";
  if (src === "aes") return "AES";
  if (src === "vballrecruiter") return "vballrecruiter";
  return src;
}

function ScrapedClubRow({ entry, isLast }: { entry: RankingEntry; isLast: boolean }) {
  const isRockstar = entry.name.toLowerCase().includes("rockstar");
  const loc = [entry.city, entry.state].filter(Boolean).join(", ");
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
      background: isRockstar ? "#E8F5EE" : "white",
      borderLeft: isRockstar ? "3px solid #1A6B3C" : "3px solid transparent",
      borderBottom: !isLast ? "1px solid #f5f5f5" : "none",
    }}>
      <div style={{ width: 32, textAlign: "right", flexShrink: 0, ...rankStyle(entry.rank) }}>{entry.rank}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{entry.name}</span>
          {isRockstar && (
            <span style={{ background: "#1A6B3C", color: "white", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 6px" }}>Your club 🏐</span>
          )}
        </div>
        {loc && <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{loc}</div>}
      </div>
      <div style={{ fontSize: 9, color: "#ccc", flexShrink: 0 }}>via {sourceLabel(entry.source)}</div>
    </div>
  );
}

function ScrapedHSRow({ entry, isLast, query = "" }: { entry: RankingEntry; isLast: boolean; query?: string }) {
  const isMira = entry.name.toLowerCase().includes("mira costa");
  const loc = [entry.city, entry.state].filter(Boolean).join(", ");
  const { move, moveAmt } = getVarsityMovement(entry.name);
  const rec = safeRecord(entry.record, entry.rank);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
      background: isMira ? "#E8F5EE" : "white",
      borderLeft: isMira ? "3px solid #1A6B3C" : "3px solid transparent",
      borderBottom: !isLast ? "1px solid #f5f5f5" : "none",
    }}>
      <div style={{ width: 32, textAlign: "right", flexShrink: 0, ...rankStyle(entry.rank) }}>{entry.rank}</div>
      <div style={{ width: 40, flexShrink: 0, textAlign: "center" }}>
        <MoveBadge move={move} amt={moveAmt} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
            <HighlightMatch text={entry.name} query={query} />
          </span>
          {isMira && (
            <span style={{ background: "#1A6B3C", color: "white", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 6px" }}>Your school 🏐</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
          {loc}{entry.division ? ` · ${entry.division}` : ""}
        </div>
      </div>
      {rec && (
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111", flexShrink: 0 }}>{rec}</div>
      )}
    </div>
  );
}

// ── Clubs tab ─────────────────────────────────────────────────────

function ClubsTab({ clubs, boysClubs, liveData }: { clubs: Club[]; boysClubs: Club[]; liveData?: LiveSection }) {
  const [gender, setGender] = useState<"girls" | "boys">("girls");
  const [expandedClub, setExpandedClub] = useState<string | null>(null);

  const isBoys = gender === "boys";
  const seedClubs = isBoys ? boysClubs : clubs;
  const showLive = !isBoys && !!(liveData && !liveData.fromCache && liveData.data.length > 0);

  return (
    <div>
      {/* Gender toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["girls", "boys"] as const).map(g => (
          <button
            key={g}
            onClick={() => { setGender(g); setExpandedClub(null); }}
            style={{
              borderRadius: 20, padding: "6px 22px", fontSize: 13, fontWeight: 700,
              border: gender === g ? "none" : "1px solid #ddd",
              background: gender === g ? "#1A6B3C" : "white",
              color: gender === g ? "white" : "#555",
              cursor: "pointer",
            }}
          >{g === "girls" ? "Girls" : "Boys"}</button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Top 25 Clubs — National</div>
        <div style={{ fontSize: 10, color: "#999" }}>Scoutly editorial · Updated weekly</div>
      </div>

      {showLive ? (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {liveData!.data.map((entry, i) => (
            <ScrapedClubRow key={entry.rank} entry={entry} isLast={i === liveData!.data.length - 1} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {seedClubs.map((club, i) => {
            const isExpanded = expandedClub === club.name;
            const isLast = i === seedClubs.length - 1;
            return (
              <div key={club.name}>
                <div
                  onClick={() => setExpandedClub(isExpanded ? null : club.name)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px",
                    borderBottom: (!isExpanded && !isLast) ? "1px solid #f5f5f5" : "none",
                    background: club.isMyClub ? "#E8F5EE" : "white",
                    borderLeft: club.isMyClub ? "3px solid #1A6B3C" : "3px solid transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { if (!club.isMyClub) e.currentTarget.style.background = "#fafaf8"; }}
                  onMouseLeave={e => { if (!club.isMyClub) e.currentTarget.style.background = club.isMyClub ? "#E8F5EE" : "white"; }}
                >
                  <div style={{ width: 32, textAlign: "right", flexShrink: 0, ...rankStyle(club.rank) }}>{club.rank}</div>
                  <div style={{ width: 40, flexShrink: 0, textAlign: "center" }}>
                    <MoveBadge move={club.move} amt={club.moveAmt} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{club.name}</span>
                      {club.isMyClub && (
                        <span style={{ background: "#1A6B3C", color: "white", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 6px" }}>Your club 🏐</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{club.location}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1A6B3C" }}>{club.score}</div>
                    <div style={{ fontSize: 9, color: "#999" }}>score</div>
                  </div>
                  <span style={{ fontSize: 12, color: "#ccc", flexShrink: 0 }}>›</span>
                </div>
                {isExpanded && (
                  <div style={{
                    background: "#fafaf8", borderLeft: "3px solid #1A6B3C",
                    padding: "12px 14px", margin: "4px 16px 8px",
                    fontSize: 12, color: "#444", lineHeight: 1.8, borderRadius: 6,
                    borderBottom: !isLast ? "1px solid #f5f5f5" : "none",
                  }}>
                    <div>Athletes on Scoutly: <strong>{club.athletes}</strong></div>
                    <div>D1 commits this year: <strong>{club.d1Commits}</strong></div>
                    <div>Top ranked athlete: <strong>{club.topAthlete}</strong></div>
                    <button style={{ marginTop: 6, background: "none", border: "none", color: "#1A6B3C", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}>
                      View club profile →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Varsity tab ───────────────────────────────────────────────────

const GIRLS_STATE_OPTIONS = [
  { key: "national", label: "National" },
  { key: "ca", label: "California" },
  { key: "tx", label: "Texas" },
  { key: "fl", label: "Florida" },
  { key: "il", label: "Illinois" },
  { key: "oh", label: "Ohio" },
  { key: "mn", label: "Minnesota" },
  { key: "az", label: "Arizona" },
  { key: "wi", label: "Wisconsin" },
  { key: "in", label: "Indiana" },
  { key: "ne", label: "Nebraska" },
  { key: "wa", label: "Washington" },
];

const BOYS_STATE_OPTIONS = [
  { key: "national", label: "National" },
  { key: "ca", label: "California" },
  { key: "tx", label: "Texas" },
  { key: "fl", label: "Florida" },
  { key: "il", label: "Illinois" },
  { key: "oh", label: "Ohio" },
  { key: "hi", label: "Hawaii" },
  { key: "az", label: "Arizona" },
  { key: "wa", label: "Washington" },
  { key: "in", label: "Indiana" },
  { key: "ut", label: "Utah" },
  { key: "co", label: "Colorado" },
];

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "#FFF3B0", color: "#111", borderRadius: 2, padding: 0 }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function VarsityTab({
  girlsVarsity,
  boysVarsity,
  lastUpdated,
}: {
  girlsVarsity?: Record<string, LiveSection>;
  boysVarsity?: Record<string, LiveSection>;
  lastUpdated?: Record<string, string> | null;
}) {
  const [gender, setGender] = useState<"girls" | "boys">("girls");
  const [stateKey, setStateKey] = useState("national");
  const [search, setSearch] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  const isBoys = gender === "boys";
  const stateOptions = isBoys ? BOYS_STATE_OPTIONS : GIRLS_STATE_OPTIONS;
  const varsityByGender = isBoys ? boysVarsity : girlsVarsity;
  const liveSection = varsityByGender?.[stateKey];
  const isCA = stateKey === "ca";
  const isFromCache = liveSection?.fromCache ?? true;
  // Use rich CA seed rows only when CA is selected and we have no live data
  const showRichCASeed = isCA && isFromCache;
  const hasLiveData = !!(liveSection && liveSection.data.length > 0);
  const selectedLabel = stateOptions.find(o => o.key === stateKey)?.label ?? "National";
  const title = `Top 25 ${gender === "girls" ? "Girls" : "Boys"} — ${selectedLabel}`;
  const lastUpdatedDate = lastUpdated?.[`maxpreps_${gender}_${stateKey}`] ?? null;
  const seedData = isBoys ? BOYS_CIF_SOUTHERN : GIRLS_CIF_SOUTHERN;

  // Filtered entries for scraped-rows path
  const allEntries = liveSection?.data ?? [];
  const filteredEntries = search.trim()
    ? allEntries.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    : allEntries;

  // Close tooltip on Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setTooltipOpen(false);
  };

  return (
    <div onKeyDown={handleKeyDown}>
      {/* Gender toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {(["girls", "boys"] as const).map(g => (
          <button
            key={g}
            onClick={() => { setGender(g); setStateKey("national"); setSearch(""); setExpandedSchool(null); }}
            style={{
              borderRadius: 20, padding: "6px 22px", fontSize: 13, fontWeight: 700,
              border: gender === g ? "none" : "1px solid #ddd",
              background: gender === g ? "#1A6B3C" : "white",
              color: gender === g ? "white" : "#555",
              cursor: "pointer",
            }}
          >{g === "girls" ? "Girls" : "Boys"}</button>
        ))}
      </div>

      {/* State dropdown + ⓘ button row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ position: "relative" }}>
          <select
            value={stateKey}
            onChange={e => { setStateKey(e.target.value); setSearch(""); setExpandedSchool(null); }}
            style={{ border: "1px solid #ddd", borderRadius: 20, padding: "5px 28px 5px 14px", fontSize: 12, color: "#555", background: "white", cursor: "pointer", appearance: "none", WebkitAppearance: "none", fontFamily: "inherit" }}
          >
            {stateOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#999" strokeWidth={2} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
        {/* Search input */}
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search schools..."
            style={{ width: "100%", padding: "5px 28px 5px 10px", border: "1px solid #ddd", borderRadius: 20, fontSize: 12, color: "#555", background: "white", fontFamily: "inherit", boxSizing: "border-box" as const, outline: "none" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#bbb", padding: 0, fontSize: 14, lineHeight: 1 }}
            >×</button>
          )}
        </div>
      </div>

      {/* Title + attribution row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
          <div style={{ fontSize: 10, color: "#999" }}>
            {lastUpdatedDate ? `via MaxPreps · Updated ${lastUpdatedDate}` : "via MaxPreps"}
          </div>
          <button
            onClick={() => setTooltipOpen(o => !o)}
            style={{ background: "none", border: "1px solid #ddd", borderRadius: "50%", width: 16, height: 16, cursor: "pointer", fontSize: 9, color: "#999", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0 }}
            aria-label="About rankings"
          >ⓘ</button>
          {tooltipOpen && (
            <>
              <div onClick={() => setTooltipOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 100 }} />
              <div style={{
                position: "absolute", right: 0, top: "100%", marginTop: 6, zIndex: 101,
                background: "white", border: "1px solid #e8e8e8", borderRadius: 10,
                padding: "12px 14px", width: 260, fontSize: 12, color: "#444", lineHeight: 1.6,
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              }}>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>About these rankings</div>
                MaxPreps aggregates results from reported high school games across the US. Rankings reflect win-loss record, strength of schedule, and playoff performance. Updated weekly during the season.
                <div style={{ marginTop: 8, color: "#aaa", fontSize: 11 }}>Scoutly is not affiliated with MaxPreps.</div>
              </div>
            </>
          )}
        </div>
      </div>

      {isBoys && (
        <div style={{ fontStyle: "italic", fontSize: 11, color: "#999", marginBottom: 10 }}>
          Boys volleyball is a spring sport. Spring 2026 season underway — rankings update weekly.
        </div>
      )}

      {/* List */}
      {showRichCASeed ? (
        // Rich CA seed rows with expandable detail
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {seedData.map((school, i) => {
            const isExpanded = expandedSchool === school.name;
            const isLast = i === seedData.length - 1;
            return (
              <div key={school.name}>
                <div
                  onClick={() => setExpandedSchool(isExpanded ? null : school.name)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                    borderBottom: (!isExpanded && !isLast) ? "1px solid #f5f5f5" : "none",
                    background: school.isMySchool ? "#E8F5EE" : "white",
                    borderLeft: school.isMySchool ? "3px solid #1A6B3C" : "3px solid transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { if (!school.isMySchool) e.currentTarget.style.background = "#fafaf8"; }}
                  onMouseLeave={e => { if (!school.isMySchool) e.currentTarget.style.background = school.isMySchool ? "#E8F5EE" : "white"; }}
                >
                  <div style={{ width: 32, textAlign: "right", flexShrink: 0, ...rankStyle(school.rank) }}>{school.rank}</div>
                  <div style={{ width: 40, flexShrink: 0, textAlign: "center" }}>
                    <MoveBadge move={school.move} amt={school.moveAmt} />
                  </div>
                  <Avatar initials={school.initials} bg={school.avatarBg} color={school.avatarColor} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{school.name}</span>
                      {school.isMySchool && (
                        <span style={{ background: "#1A6B3C", color: "white", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 6px" }}>Your school 🏐</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{school.location}</div>
                  </div>
                  {school.record && (
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111", flexShrink: 0 }}>{school.record}</div>
                  )}
                  <span style={{ fontSize: 12, color: "#ccc", flexShrink: 0 }}>›</span>
                </div>
                {isExpanded && (
                  <div style={{
                    background: "#fafaf8", borderLeft: "3px solid #1A6B3C",
                    padding: "12px 14px", margin: "4px 16px 8px",
                    fontSize: 12, color: "#444", lineHeight: 1.8, borderRadius: 6,
                    borderBottom: !isLast ? "1px solid #f5f5f5" : "none",
                  }}>
                    <div>Division: <strong>{school.division}</strong></div>
                    <div>2025 CIF finish: <strong>{school.cifFinish}</strong></div>
                    <div>Head coach: <strong>{school.headCoach}</strong></div>
                    <button style={{ marginTop: 6, background: "none", border: "none", color: "#1A6B3C", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}>
                      View school profile →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : hasLiveData ? (
        // Scraped rows (live or other-state seed data)
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry, i) => (
              <ScrapedHSRow
                key={entry.rank}
                entry={entry}
                isLast={i === filteredEntries.length - 1}
                query={search}
              />
            ))
          ) : (
            <div style={{ padding: "28px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#999", marginBottom: 8 }}>
                No results for &ldquo;{search}&rdquo;
              </div>
              <a
                href={`https://www.maxpreps.com/volleyball/rankings/1/`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#1A6B3C", fontWeight: 700, textDecoration: "none" }}
              >
                Search on MaxPreps →
              </a>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: "white", border: "1px solid #e8e8e8", borderRadius: 10, padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#999" }}>Rankings for this state coming soon.</div>
        </div>
      )}
    </div>
  );
}

// ── JV tab ────────────────────────────────────────────────────────

function JVTab() {
  const { showToast } = useApp();
  return (
    <div style={{
      background: "white", border: "1px solid #e8e8e8", borderRadius: 10,
      padding: "40px 20px", textAlign: "center",
    }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>🏐</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 8 }}>JV Rankings coming soon</div>
      <div style={{ fontSize: 13, color: "#999", maxWidth: 300, margin: "0 auto 20px" }}>
        We&apos;re working on bringing JV volleyball rankings to Scoutly. Check back soon.
      </div>
      <button
        onClick={() => showToast("You're on the list! We'll notify you when JV rankings launch.")}
        style={{
          background: "none", border: "1px solid #1A6B3C", color: "#1A6B3C",
          borderRadius: 20, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}
      >
        Get notified when JV rankings launch →
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

const TABS: { key: RankingsTab; label: string }[] = [
  { key: "clubs", label: "Clubs" },
  { key: "hs",    label: "Varsity" },
  { key: "jv",    label: "JV" },
];

export default function RankingsPage() {
  const [tab, setTab] = useState<RankingsTab>("clubs");
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [allFailed, setAllFailed] = useState(false);

  useEffect(() => {
    fetch("/api/rankings")
      .then(r => r.json())
      .then((data: LiveData) => {
        setLiveData(data);
        setAllFailed(data.fallback === true);
      })
      .catch(() => setAllFailed(true))
      .finally(() => setLoading(false));
  }, []);

  const liveClubsSection = liveData?.clubs.girls.all;
  const girlsVarsity     = liveData?.varsity.girls;
  const boysVarsity      = liveData?.varsity.boys;
  const lastUpdated      = liveData?.sources.lastUpdated ?? null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 2px" }}>Scoutly Rankings</h1>
        <div style={{ fontSize: 13, color: "#999" }}>Volleyball · Curated weekly by the Scoutly team</div>
        <div style={{ fontSize: 10, color: "#999", fontStyle: "italic", marginTop: 4 }}>
          Scoutly Club Power Rankings · Editorial rankings based on 2025 GJNC results, qualifier performance, and tournament data. Updated weekly by the Scoutly team.
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e8e8e8", marginBottom: 20 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              fontSize: 13, padding: "10px 20px", cursor: "pointer",
              background: "none", border: "none",
              borderBottom: tab === t.key ? "2px solid #1A6B3C" : "2px solid transparent",
              color: tab === t.key ? "#111" : "#999",
              fontWeight: tab === t.key ? 600 : 400,
              whiteSpace: "nowrap",
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Fallback banner */}
      {!loading && allFailed && (
        <div style={{ fontStyle: "italic", fontSize: 11, color: "#999", marginBottom: 8 }}>
          Showing recent data · Live rankings temporarily unavailable
        </div>
      )}

      {/* Shimmer while loading, tabs after */}
      {loading ? (
        <ShimmerRows />
      ) : (
        <>
          {tab === "clubs" && <ClubsTab clubs={CLUBS} boysClubs={BOYS_CLUBS} liveData={liveClubsSection} />}
          {tab === "hs"    && <VarsityTab girlsVarsity={girlsVarsity} boysVarsity={boysVarsity} lastUpdated={lastUpdated} />}
          {tab === "jv"    && <JVTab />}
        </>
      )}
    </div>
  );
}
