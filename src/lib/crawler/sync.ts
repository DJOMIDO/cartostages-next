import { createHash } from "node:crypto";
import { db } from "@/lib/db/client";
import { offers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { parseOfferTable, WAGA_OFFRES_URL, type ParsedOffer } from "./parse";
import { resolveCityCoords } from "./city-coords";

export interface SyncResult {
  fetched: number;
  inserted: number;
  updated: number;
  unchanged: number;
}

function offerId(sourceId: string): string {
  return createHash("sha256").update(sourceId).digest("hex").slice(0, 24);
}

export async function syncWaga(): Promise<SyncResult> {
  const res = await fetch(WAGA_OFFRES_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`waga fetch failed: ${res.status}`);
  const html = await res.text();
  const parsed = parseOfferTable(html);

  const existing = await db.select().from(offers).where(eq(offers.source, "waga"));
  const bySource = new Map(existing.map((o) => [o.sourceId, o]));

  let inserted = 0, updated = 0, unchanged = 0;
  for (const p of parsed) {
    const coords = resolveCityCoords(p.city || p.location || "");
    const values = {
      title: p.title,
      organization: p.organization,
      location: p.location,
      city: p.city,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      contractType: p.contractType,
      postedAt: p.postedAt,
      descriptionUrl: p.descriptionUrl,
      sourceId: p.sourceId,
      source: "waga",
      updatedAt: new Date(),
    };
    const prev = bySource.get(p.sourceId);
    if (!prev) {
      await db.insert(offers).values({ ...values, id: offerId(p.sourceId) });
      inserted++;
    } else if (
      prev.title !== values.title ||
      prev.organization !== values.organization ||
      prev.location !== values.location ||
      prev.postedAt !== values.postedAt ||
      prev.archived
    ) {
      await db
        .update(offers)
        .set({ ...values, archived: false })
        .where(and(eq(offers.id, prev.id)));
      updated++;
    } else {
      unchanged++;
    }
  }
  return { fetched: parsed.length, inserted, updated, unchanged };
}
