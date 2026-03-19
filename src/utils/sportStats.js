// Sport-specific stat definitions for profile display.
// key: field name on athlete.stats[key] or athlete[key]
// format: "pct" → "94%", "decimal" → "4.2", "number" → "18",
//         "avg" → ".342", "time" → as-is text, "text" → as-is
// placeholder: example value shown when no data

export const SPORT_STATS = {
  volleyball: [
    { key: "killPct",       label: "Kill%",       format: "pct",     placeholder: "42" },
    { key: "killsPerSet",   label: "Kills/set",   format: "decimal", placeholder: "3.8" },
    { key: "attacksPerSet", label: "Attacks/set", format: "decimal", placeholder: "8.2" },
    { key: "hitPct",        label: "Hit%",        format: "avg",     placeholder: ".312" },
  ],
  soccer: [
    { key: "goals",       label: "Goals",        format: "number",  placeholder: "14" },
    { key: "assists",     label: "Assists",       format: "number",  placeholder: "22" },
    { key: "cleanSheets", label: "Clean sheets",  format: "number",  placeholder: "8" },
    { key: "gpa",         label: "GPA",           format: "decimal", placeholder: "3.8" },
  ],
  basketball: [
    { key: "ppg",  label: "PPG", format: "decimal", placeholder: "18.4" },
    { key: "rpg",  label: "RPG", format: "decimal", placeholder: "7.2" },
    { key: "apg",  label: "APG", format: "decimal", placeholder: "5.1" },
    { key: "gpa",  label: "GPA", format: "decimal", placeholder: "3.8" },
  ],
  baseball: [
    { key: "avg", label: "AVG", format: "avg",     placeholder: ".342" },
    { key: "era", label: "ERA", format: "decimal", placeholder: "2.14" },
    { key: "hr",  label: "HR",  format: "number",  placeholder: "8" },
    { key: "gpa", label: "GPA", format: "decimal", placeholder: "3.8" },
  ],
  softball: [
    { key: "avg", label: "AVG", format: "avg",     placeholder: ".385" },
    { key: "era", label: "ERA", format: "decimal", placeholder: "1.82" },
    { key: "rbi", label: "RBI", format: "number",  placeholder: "24" },
    { key: "gpa", label: "GPA", format: "decimal", placeholder: "3.8" },
  ],
  football: [
    { key: "fortyYard", label: "40 yard",  format: "time",    placeholder: "4.52" },
    { key: "bench",     label: "Bench",    format: "number",  placeholder: "225" },
    { key: "vertical",  label: "Vertical", format: "inches",  placeholder: "34" },
    { key: "gpa",       label: "GPA",      format: "decimal", placeholder: "3.8" },
  ],
  tennis: [
    { key: "utr",        label: "UTR",      format: "decimal", placeholder: "8.4" },
    { key: "ranking",    label: "Ranking",  format: "number",  placeholder: "142" },
    { key: "serveSpeed", label: "Serve mph",format: "number",  placeholder: "98" },
    { key: "gpa",        label: "GPA",      format: "decimal", placeholder: "3.8" },
  ],
  golf: [
    { key: "handicap",     label: "Handicap",   format: "decimal", placeholder: "2.4" },
    { key: "avgScore",     label: "Avg score",  format: "decimal", placeholder: "74.2" },
    { key: "driveDistance",label: "Drive yds",  format: "number",  placeholder: "285" },
    { key: "gpa",          label: "GPA",        format: "decimal", placeholder: "3.8" },
  ],
  swimming: [
    { key: "primaryEvent",   label: "Best event", format: "text",    placeholder: "100 Free" },
    { key: "bestTime",       label: "Best time",  format: "time",    placeholder: "47.82" },
    { key: "secondaryEvent", label: "2nd event",  format: "text",    placeholder: "200 Free" },
    { key: "gpa",            label: "GPA",        format: "decimal", placeholder: "3.8" },
  ],
  track: [
    { key: "primaryEvent",   label: "Primary event", format: "text",    placeholder: "100m" },
    { key: "pr",             label: "PR",            format: "time",    placeholder: "10.84" },
    { key: "secondaryEvent", label: "2nd event",     format: "text",    placeholder: "200m" },
    { key: "gpa",            label: "GPA",           format: "decimal", placeholder: "3.8" },
  ],
  lacrosse: [
    { key: "goals",       label: "Goals",   format: "number",  placeholder: "28" },
    { key: "assists",     label: "Assists", format: "number",  placeholder: "14" },
    { key: "groundBalls", label: "GBs",    format: "number",  placeholder: "42" },
    { key: "gpa",         label: "GPA",    format: "decimal", placeholder: "3.8" },
  ],
  waterpolo: [
    { key: "goalsPerGame", label: "Goals/game", format: "decimal", placeholder: "3.2" },
    { key: "assists",      label: "Assists",    format: "number",  placeholder: "18" },
    { key: "savePct",      label: "Save%",      format: "pct",     placeholder: "72" },
    { key: "gpa",          label: "GPA",        format: "decimal", placeholder: "3.8" },
  ],
  wrestling: [
    { key: "record",      label: "Record",      format: "text",   placeholder: "28-4" },
    { key: "weightClass", label: "Weight class",format: "number", placeholder: "152" },
    { key: "pins",        label: "Pins",        format: "number", placeholder: "14" },
    { key: "gpa",         label: "GPA",         format: "decimal",placeholder: "3.8" },
  ],
  equestrian: [
    { key: "discipline", label: "Discipline", format: "text",    placeholder: "Hunter/Jumper" },
    { key: "level",      label: "Level",      format: "text",    placeholder: "A Circuit" },
    { key: "horse",      label: "Horse name", format: "text",    placeholder: "Optional" },
    { key: "gpa",        label: "GPA",        format: "decimal", placeholder: "3.8" },
  ],
  other: [
    { key: "gpa", label: "GPA", format: "decimal", placeholder: "3.8" },
  ],
};

function normalizeSport(sport) {
  return (sport || "other").toLowerCase().replace(/\s+/g, "").replace(/_/g, "");
}

function lookupValue(athlete, key) {
  if (athlete.stats && key in athlete.stats) return athlete.stats[key];
  if (key in athlete) return athlete[key];
  return null;
}

export function formatStat(value, format) {
  if (value === null || value === undefined) return "—";
  if (format === "pct")     return `${value}%`;
  if (format === "decimal") return typeof value === "number" ? value.toFixed(1) : value;
  if (format === "avg")     return typeof value === "number" ? value.toFixed(3).replace(/^0/, "") : value;
  if (format === "inches")  return `${value}"`;
  return String(value);
}

/** @returns {{ label: string; value: string }[]} */
export function getDisplayStats(sport, athlete) {
  const key = normalizeSport(sport);
  const defs = SPORT_STATS[key] || SPORT_STATS.other;
  return defs.map(d => ({
    label: d.label,
    value: formatStat(lookupValue(athlete, d.key), d.format),
  }));
}
