export const WAGA_BASE = "http://w3.erss.univ-tlse2.fr/membre/tanguy/";
export const WAGA_OFFRES_URL = `${WAGA_BASE}offres.html`;

export type ContractType = "stage" | "cdi-cdd" | "post-doc";

export interface ParsedOffer {
  sourceId: string;
  title: string;
  organization: string;
  location: string;
  city: string;
  contractType: ContractType;
  postedAt: string | null; // ISO yyyy-mm-dd
  descriptionUrl: string | null;
}

const SECTION_ANCHORS: { name: string; type: ContractType }[] = [
  { name: "CD", type: "cdi-cdd" },
  { name: "PD", type: "post-doc" },
  { name: "Stages", type: "stage" },
];

function normalizeDate(fr: string): string | null {
  const m = fr.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function parseLocation(raw: string): { location: string; city: string } {
  const parts = raw.split(",").map((s) => s.trim());
  const city = (parts[parts.length - 1] ?? "").toLowerCase();
  return { location: raw.trim(), city };
}

export function parseOfferTable(html: string): ParsedOffer[] {
  const offers: ParsedOffer[] = [];
  for (const { name, type } of SECTION_ANCHORS) {
    const anchorIdx = html.search(new RegExp(`name=["']${name}["']`, "i"));
    if (anchorIdx < 0) continue;
    const nextIdx = SECTION_ANCHORS.map((s) =>
      html.search(new RegExp(`name=["']${s.name}["']`, "i"))
    )
      .filter((i) => i > anchorIdx)
      .sort((a, b) => a - b)[0];
    const section = html.slice(anchorIdx, nextIdx ?? html.length);
    const rows = section.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
    for (const row of rows) {
      const cells = row.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) ?? [];
      if (cells.length < 4) continue;
      const textOf = (c: string) =>
        c
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
          .replace(/\s+/g, " ")
          .trim();
      const [dateCell, orgCell, locCell, titleCell] = cells;
      const hrefMatch = titleCell.match(/href=["']([^"']+)["']/i);
      const title = textOf(titleCell);
      if (!title) continue;
      const sourceId = hrefMatch ? hrefMatch[1] : `waga-${type}-${normalizeDate(textOf(dateCell))}-${title}`;
      const { location, city } = parseLocation(textOf(locCell));
      offers.push({
        sourceId: `waga:${sourceId}`,
        title,
        organization: textOf(orgCell),
        location,
        city,
        contractType: type,
        postedAt: normalizeDate(textOf(dateCell)),
        descriptionUrl: hrefMatch ? new URL(hrefMatch[1], WAGA_OFFRES_URL).href : null,
      });
    }
  }
  return offers;
}
