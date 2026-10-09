// Regenerates src/lib/crawler/city-coords.ts from the current WAGA page.
// Usage: npx tsx --env-file=.env scripts/geocode-cities.mts
// Rate-limited Nominatim lookups (1 req/s, custom User-Agent per OSM policy).

import { writeFile } from "node:fs/promises";

const WAGA_URL = "http://w3.erss.univ-tlse2.fr/membre/tanguy/offres.html";
const OUT = new URL("../src/lib/crawler/city-coords.ts", import.meta.url);

// Manual normalisations for multi-city / special location strings.
const FIXES: Record<string, string | null> = {
  "grenoble ou rennes": "grenoble",
  "la défense": "paris",
  "neuilly": "neuilly-sur-seine",
  "orsay / jouy-en-josas": "orsay",
  "paris / marseille": "paris",
  "paris ou montpellier": "paris",
  "paris ou télétravail": "paris",
  "montpellier ou paris": "montpellier",
  "sophia-antipolis": "valbonne",
  "télétravail": null,
};

async function fetchCities(): Promise<string[]> {
  const html = await fetch(WAGA_URL).then((r) => r.text());
  const cities = new Set<string>();
  for (const row of html.match(/<tr[\s\S]*?<\/tr>/gi) ?? []) {
    const cells = row.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) ?? [];
    if (cells.length < 4) continue;
    const text = (c: string) => c.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
    const loc = text(cells[2]);
    if (loc) cities.add(loc);
  }
  return [...cities].sort();
}

async function geocode(city: string): Promise<{ lat: number; lng: number } | null> {
  const q = FIXES[city] ?? city;
  if (q === null) return null;
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({ q, format: "json", limit: "1", countrycodes: "fr" })}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "cartostages-next-seed/1.0" } });
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data[0]) return null;
    return { lat: Math.round(Number(data[0].lat) * 1e4) / 1e4, lng: Math.round(Number(data[0].lon) * 1e4) / 1e4 };
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const cities = await fetchCities();
const entries: string[] = [];
for (const city of cities) {
  const coords = await geocode(city);
  if (coords) entries.push(`  "${city}": { lat: ${coords.lat}, lng: ${coords.lng} },`);
  else console.warn("unresolved:", city);
  await sleep(1100);
}

const existing = await readFileSafe();
function mergePreserve(newEntries: string[]): string[] {
  const seen = new Set(newEntries.map((e) => e.trim().split(":")[0].replace(/[" ,]/g, "")));
  const kept = existing
    .split("\n")
    .filter((l) => /^\s*"/.test(l))
    .filter((l) => !seen.has(l.trim().split(":")[0].replace(/[" ,]/g, "")));
  return [...newEntries, ...kept].sort();
}

async function readFileSafe(): Promise<string> {
  try {
    return await (await import("node:fs/promises")).readFile(OUT, "utf8");
  } catch {
    return "";
  }
}

const merged = await mergePreserve(entries);
const file = `// Static city -> coordinates table. Regenerate with scripts/geocode-cities.mts.
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
${merged.join("\n")}
};

export function resolveCityCoords(raw: string): { lat: number; lng: number } | null {
  const norm = raw.toLowerCase().trim();
  if (CITY_COORDS[norm]) return CITY_COORDS[norm];
  for (const sep of [" ou ", " / ", ","]) {
    if (norm.includes(sep)) {
      const first = norm.split(sep)[0].trim();
      if (CITY_COORDS[first]) return CITY_COORDS[first];
    }
  }
  const token = norm.split(/\\s+/)[0];
  return CITY_COORDS[token] ?? null;
}
`;
await writeFile(OUT, file);
console.log(`wrote ${merged.length} city coordinates -> ${OUT.pathname}`);
