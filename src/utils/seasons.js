// Single source of truth for official sanctioned competitive seasons.
// Governing bodies: USAV/JVA, NFHS, ECNL/DA/NPL, AAU/EYBL,
//   USA Swimming, USATF, USTA, AJGA, USA Wrestling, USAWP, USEF
// Only official sanctioned competitive seasons — no spring practice,
//   no recruiting seasons, no training periods.
//
// Display rules:
// 1. Football only in "Also in season" during months [8,9,10,11].
// 2. Equestrian only surfaces for athletes who selected it.
// 3. Swimming: surface as "in season" only in [2,3,4,6,7,8].
// 4. Tennis/Golf USTA/AJGA year-round circuits: surface only in [3,4,5,8,9,10].
// 5. "both" gender sports: getCurrentSeason() returns same result regardless of gender.

export const SEASONS = {

  volleyball: {
    female: [
      {
        name: "Club season",
        months: [1,2,3,4,5,6,7],
        govBody: "USAV / JVA",
        description: "USAV club circuit, national qualifiers, GJNC bid hunt",
      },
      {
        name: "High school season",
        months: [8,9,10,11],
        govBody: "NFHS",
        description: "High school varsity, state championships, CIF sectionals",
      },
    ],
    male: [
      {
        name: "Club season",
        months: [2,3,4,5,6],
        govBody: "USAV",
        description: "USAV boys club circuit, national qualifiers",
      },
      {
        name: "High school season",
        months: [3,4,5],
        govBody: "NFHS",
        description: "High school varsity — spring states (most common)",
      },
      {
        name: "High school season (fall)",
        months: [9,10,11],
        govBody: "NFHS",
        description: "High school varsity — fall states",
      },
    ],
  },

  soccer: {
    female: [
      {
        name: "Club season",
        months: [1,2,3,4,5,6,7],
        govBody: "ECNL / DA / NPL",
        description: "Club circuit, ECNL events, national showcases",
      },
      {
        name: "High school fall season",
        months: [8,9,10,11],
        govBody: "NFHS",
        description: "High school varsity, state playoffs",
      },
      {
        name: "High school spring season",
        months: [2,3,4,5],
        govBody: "NFHS",
        description: "High school spring season, select states only",
      },
    ],
    male: [
      {
        name: "Club season",
        months: [2,3,4,5,6,7,8],
        govBody: "ECNL / DA / NPL",
        description: "Club circuit, ECNL events, national showcases",
      },
      {
        name: "High school fall season",
        months: [8,9,10,11],
        govBody: "NFHS",
        description: "High school varsity, state playoffs",
      },
      {
        name: "High school spring season",
        months: [3,4,5],
        govBody: "NFHS",
        description: "High school spring season, select states only",
      },
    ],
  },

  basketball: {
    female: [
      {
        name: "Club / AAU season",
        months: [3,4,5,6,7],
        govBody: "AAU / EYBL",
        description: "AAU circuit, grassroots events, live periods",
      },
      {
        name: "High school season",
        months: [11,12,1,2],
        govBody: "NFHS",
        description: "High school varsity, state championships",
      },
    ],
    male: [
      {
        name: "Club / AAU season",
        months: [3,4,5,6,7],
        govBody: "AAU / EYBL",
        description: "AAU circuit, EYBL, grassroots live periods",
      },
      {
        name: "High school season",
        months: [11,12,1,2],
        govBody: "NFHS",
        description: "High school varsity, state championships",
      },
    ],
  },

  baseball: {
    male: [
      {
        name: "Club / travel season",
        months: [1,2,3,4,5,6,7],
        govBody: "USSSA / Perfect Game / PBR",
        description: "Travel ball, showcases, PBR events",
      },
      {
        name: "High school season",
        months: [2,3,4,5],
        govBody: "NFHS",
        description: "High school varsity, state playoffs",
      },
    ],
  },

  softball: {
    female: [
      {
        name: "Club / travel season",
        months: [1,2,3,4,5,6,7],
        govBody: "USSSA / PGF",
        description: "Travel ball, PGF events, national qualifiers",
      },
      {
        name: "High school season",
        months: [2,3,4,5],
        govBody: "NFHS",
        description: "High school varsity, state playoffs",
      },
    ],
  },

  football: {
    male: [
      {
        name: "High school season",
        months: [8,9,10,11],
        govBody: "NFHS",
        description: "High school varsity, state playoffs",
      },
    ],
  },

  track: {
    both: [
      {
        name: "Indoor season",
        months: [11,12,1,2],
        govBody: "NFHS / USATF",
        description: "Indoor track and field, state indoor championships",
      },
      {
        name: "Outdoor season",
        months: [3,4,5,6],
        govBody: "NFHS / USATF",
        description: "Outdoor track and field, state championships",
      },
      {
        name: "Club / summer season",
        months: [6,7,8],
        govBody: "USATF / AAU",
        description: "USATF junior circuit, AAU track events",
      },
    ],
  },

  swimming: {
    both: [
      {
        name: "Club season",
        months: [9,10,11,12,1,2,3,4,5,6,7,8],
        govBody: "USA Swimming",
        description: "USA Swimming sanctioned club meets, year round",
      },
      {
        name: "High school championship season",
        months: [2,3,4],
        govBody: "NFHS",
        description: "High school state championships and sectionals",
      },
      {
        name: "Summer championship season",
        months: [6,7,8],
        govBody: "USA Swimming",
        description: "Summer junior nationals, sectionals, zone championships",
      },
    ],
  },

  tennis: {
    both: [
      {
        name: "High school spring season",
        months: [3,4,5],
        govBody: "NFHS",
        description: "High school varsity — spring states (majority)",
      },
      {
        name: "High school fall season",
        months: [8,9,10],
        govBody: "NFHS",
        description: "High school varsity — fall states",
      },
      {
        name: "USTA junior circuit",
        months: [1,2,3,4,5,6,7,8,9,10,11,12],
        govBody: "USTA",
        description: "USTA sanctioned junior tournaments, year round",
      },
    ],
  },

  lacrosse: {
    female: [
      {
        name: "Club season",
        months: [1,2,3,4,5,6,7],
        govBody: "US Lacrosse",
        description: "Club circuit, national qualifiers",
      },
      {
        name: "High school season",
        months: [2,3,4,5],
        govBody: "NFHS",
        description: "High school varsity, state championships",
      },
    ],
    male: [
      {
        name: "Club season",
        months: [1,2,3,4,5,6,7],
        govBody: "US Lacrosse",
        description: "Club circuit, national qualifiers",
      },
      {
        name: "High school season",
        months: [3,4,5],
        govBody: "NFHS",
        description: "High school varsity, state championships",
      },
    ],
  },

  wrestling: {
    both: [
      {
        name: "High school season",
        months: [11,12,1,2],
        govBody: "NFHS",
        description: "High school varsity, state championships",
      },
      {
        name: "Freestyle / Greco season",
        months: [3,4,5,6,7,8,9,10],
        govBody: "USA Wrestling",
        description: "USA Wrestling sanctioned freestyle and folkstyle events",
      },
    ],
  },

  waterpolo: {
    female: [
      {
        name: "Club season",
        months: [1,2,3,4,5,6,7],
        govBody: "USA Water Polo",
        description: "USAWP club circuit, national championships",
      },
      {
        name: "High school season",
        months: [8,9,10,11],
        govBody: "NFHS",
        description: "High school varsity, CIF sectionals",
      },
    ],
    male: [
      {
        name: "Club season",
        months: [1,2,3,4,5,6,7],
        govBody: "USA Water Polo",
        description: "USAWP club circuit, national championships",
      },
      {
        name: "High school season",
        months: [8,9,10,11],
        govBody: "NFHS",
        description: "High school varsity, CIF sectionals",
      },
    ],
  },

  golf: {
    both: [
      {
        name: "High school spring season",
        months: [3,4,5],
        govBody: "NFHS",
        description: "High school varsity — spring states",
      },
      {
        name: "High school fall season",
        months: [8,9,10],
        govBody: "NFHS",
        description: "High school varsity — fall states",
      },
      {
        name: "AJGA junior circuit",
        months: [1,2,3,4,5,6,7,8,9,10,11,12],
        govBody: "AJGA",
        description: "AJGA sanctioned junior tournaments, year round",
      },
    ],
  },

  equestrian: {
    both: [
      {
        name: "Show season",
        months: [1,2,3,4,5,6,7,8,9,10,11,12],
        govBody: "USEF",
        description: "USEF rated shows, equitation circuit, year round",
      },
      {
        name: "Indoors / finals season",
        months: [9,10,11,2,3,4],
        govBody: "USEF",
        description: "Medal finals, indoors championships",
      },
    ],
  },
};

function normalizeSport(sport) {
  return (sport || "").toLowerCase().replace(/\s+/g, "").replace(/_/g, "");
}

export function getCurrentSeason(sport, gender = null) {
  const month = new Date().getMonth() + 1;
  const sportData = SEASONS[normalizeSport(sport)];
  if (!sportData) return null;

  const seasons = sportData[gender] || sportData.both || null;
  if (!seasons) return null;

  return seasons.find(s => s.months.includes(month)) || null;
}

export function getNextSeason(sport, gender = null) {
  const month = new Date().getMonth() + 1;
  const sportData = SEASONS[normalizeSport(sport)];
  if (!sportData) return null;

  const seasons = sportData[gender] || sportData.both || null;
  if (!seasons) return null;

  const future = seasons.filter(s => !s.months.includes(month));
  return future.sort((a, b) => {
    const aNext = a.months.find(m => m > month) || (Math.min(...a.months) + 12);
    const bNext = b.months.find(m => m > month) || (Math.min(...b.months) + 12);
    return aNext - bNext;
  })[0] || null;
}

export function getActiveSports(sports, gender = null) {
  if (!sports || !sports.length) return [];
  const month = new Date().getMonth() + 1;

  const active = sports.filter(sport => {
    const sportData = SEASONS[normalizeSport(sport)];
    if (!sportData) return false;
    const seasons = sportData[gender] || sportData.both || null;
    if (!seasons) return false;
    return seasons.some(s => s.months.includes(month));
  });

  if (active.length > 0) return active;
  return [sports[0]];
}

export function getAllInSeasonSports(gender = null) {
  const month = new Date().getMonth() + 1;
  return Object.entries(SEASONS)
    .filter(([key, sportData]) => {
      if (key === "other") return false;
      const seasons = sportData[gender] || sportData.both || null;
      return seasons ? seasons.some(s => s.months.includes(month)) : false;
    })
    .map(([key]) => key);
}

export function getSeasonNewsBoost(sport, gender = null) {
  const season = getCurrentSeason(sport, gender);
  if (!season) return [];

  const boostMap = {
    "Club season": [
      "qualifier", "tournament", "bid", "gjnc",
      "club", "jva", "usav", "showcase", "national",
    ],
    "High school season": [
      "high school", "varsity", "state", "section",
      "playoff", "cif", "nfhs",
    ],
    "High school fall season": [
      "high school", "varsity", "state", "playoff",
    ],
    "High school spring season": [
      "high school", "varsity", "state", "playoff",
    ],
    "High school season (fall)": [
      "high school", "varsity", "state", "playoff",
    ],
    "Club / AAU season": [
      "aau", "eybl", "grassroots", "live",
      "circuit", "showcase",
    ],
    "Club / travel season": [
      "travel", "showcase", "perfect game",
      "usssa", "tournament",
    ],
    "Outdoor season": [
      "track", "field", "outdoor", "state",
      "championship", "usatf",
    ],
    "Indoor season": [
      "indoor", "track", "field", "championship",
    ],
    "Club / summer season": [
      "track", "field", "usatf", "aau", "summer",
    ],
    "High school championship season": [
      "swimming", "championship", "state",
      "sectional", "finals",
    ],
    "Summer championship season": [
      "swimming", "junior nationals", "sectionals",
      "zone", "summer",
    ],
    "High school spring season": [
      "tennis", "high school", "varsity", "state",
    ],
    "High school fall season": [
      "tennis", "golf", "high school", "varsity", "state",
    ],
    "USTA junior circuit": [
      "tennis", "usta", "junior", "tournament",
    ],
    "AJGA junior circuit": [
      "golf", "ajga", "junior", "tournament",
    ],
    "Freestyle / Greco season": [
      "wrestling", "freestyle", "folkstyle",
      "usa wrestling",
    ],
    "High school fall season": [
      "golf", "high school", "varsity", "state",
    ],
    "Show season": [
      "equestrian", "usef", "show", "horse",
    ],
    "Indoors / finals season": [
      "equestrian", "medal", "finals", "indoors",
    ],
  };

  return boostMap[season.name] || [];
}
