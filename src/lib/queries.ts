import { db } from "@/lib/db/client";
import { offers } from "@/lib/db/schema";
import { and, eq, ilike, or, desc, sql, isNotNull } from "drizzle-orm";
import type { Offer } from "@/lib/db/schema";

const ACTIVE = eq(offers.archived, false);

export async function listOffers(opts: {
  search?: string;
  contractType?: string;
  limit?: number;
} = {}): Promise<Offer[]> {
  const conditions = [ACTIVE];
  if (opts.search) {
    const s = `%${opts.search}%`;
    conditions.push(or(ilike(offers.title, s), ilike(offers.organization, s), ilike(offers.location, s))!);
  }
  if (opts.contractType && opts.contractType !== "all") {
    conditions.push(eq(offers.contractType, opts.contractType as Offer["contractType"]));
  }
  return db
    .select()
    .from(offers)
    .where(and(...conditions))
    .orderBy(desc(offers.postedAt), desc(offers.createdAt))
    .limit(opts.limit ?? 500);
}

export async function getStats() {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      stages: sql<number>`count(*) filter (where ${eq(offers.contractType, "stage")})::int`,
      cities: sql<number>`count(distinct ${offers.city}) filter (where ${isNotNull(offers.city)})::int`,
      orgs: sql<number>`count(distinct ${offers.organization})::int`,
    })
    .from(offers)
    .where(ACTIVE);
  return row;
}

export async function listAllForAdmin(opts: { archived?: boolean } = {}): Promise<Offer[]> {
  const q = db.select().from(offers);
  if (opts.archived !== undefined) {
    return q.where(eq(offers.archived, opts.archived)).orderBy(desc(offers.postedAt)).all();
  }
  return q.orderBy(desc(offers.postedAt)).all();
}

export async function getOfferById(id: string) {
  return db.select().from(offers).where(eq(offers.id, id)).get();
}
