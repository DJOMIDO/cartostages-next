// Static city -> coordinates table, generated from geo API lookups on 2026-10-09.
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "aix-en-provence": { lat: 43.5298, lng: 5.4475 },
  "avignon": { lat: 43.9492, lng: 4.8059 },
  "besançon": { lat: 47.238, lng: 6.0244 },
  "blois": { lat: 47.5877, lng: 1.3338 },
  "brest": { lat: 48.3905, lng: -4.486 },
  "bry-sur-marne": { lat: 48.8353, lng: 2.5193 },
  "caen": { lat: 49.1813, lng: -0.3636 },
  "cergy": { lat: 49.0528, lng: 2.0389 },
  "champs-sur-marne": { lat: 48.8527, lng: 2.6027 },
  "clamart": { lat: 48.8004, lng: 2.263 },
  "grenoble": { lat: 45.1876, lng: 5.7358 },
  "grenoble ou rennes": { lat: 45.1876, lng: 5.7358 },
  "issy-les-moulineaux": { lat: 48.8251, lng: 2.2735 },
  "jouy-en-josas": { lat: 48.7646, lng: 2.1685 },
  "la défense": { lat: 48.8535, lng: 2.3484 },
  "lannion": { lat: 48.7322, lng: -3.4588 },
  "lille": { lat: 50.6366, lng: 3.0635 },
  "louvain-la-neuve": { lat: 45.9899, lng: 4.7636 },
  "lyon": { lat: 45.7578, lng: 4.832 },
  "marseille": { lat: 43.2964, lng: 5.3778 },
  "meudon": { lat: 48.8127, lng: 2.2385 },
  "montpellier": { lat: 43.6112, lng: 3.8767 },
  "montpellier ou paris": { lat: 43.6112, lng: 3.8767 },
  "nancy": { lat: 48.6937, lng: 6.1834 },
  "nanterre": { lat: 48.8924, lng: 2.2071 },
  "nantes": { lat: 47.2186, lng: -1.5541 },
  "neuilly": { lat: 48.8847, lng: 2.2696 },
  "nice": { lat: 43.7009, lng: 7.2684 },
  "orléans": { lat: 47.9027, lng: 1.9086 },
  "orsay": { lat: 48.6992, lng: 2.1875 },
  "orsay / jouy-en-josas": { lat: 48.6992, lng: 2.1875 },
  "palaiseau": { lat: 48.7145, lng: 2.2454 },
  "paris": { lat: 48.8535, lng: 2.3484 },
  "paris / marseille": { lat: 48.8535, lng: 2.3484 },
  "paris ou montpellier": { lat: 48.8535, lng: 2.3484 },
  "paris ou télétravail": { lat: 48.8535, lng: 2.3484 },
  "rennes": { lat: 48.1113, lng: -1.68 },
  "saclay": { lat: 48.7305, lng: 2.1726 },
  "saint-denis": { lat: 48.9384, lng: 2.3628 },
  "sophia-antipolis": { lat: 43.6411, lng: 7.0086 },
  "toulouse": { lat: 43.6045, lng: 1.4442 },
  "tours": { lat: 47.39, lng: 0.6889 },
  "troyes": { lat: 48.2972, lng: 4.0746 },
  "villetaneuse": { lat: 48.9612, lng: 2.344 },
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
  const token = norm.split(/\s+/)[0];
  return CITY_COORDS[token] ?? null;
}
