import {
  pgTable,
  text,
  timestamp,
  date,
  integer,
  boolean,
  doublePrecision,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const offers = pgTable(
  "offers",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    organization: text("organization").notNull(),
    location: text("location"),
    city: text("city"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    contractType: text("contract_type").$type<"stage" | "cdi-cdd" | "post-doc">().notNull(),
    postedAt: date("posted_at"),
    descriptionUrl: text("description_url"),
    sourceId: text("source_id").notNull(),
    source: text("source").notNull().default("waga"),
    archived: boolean("archived").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("offers_source_id_key").on(t.sourceId),
    index("offers_city_idx").on(t.city),
    index("offers_contract_type_idx").on(t.contractType),
  ]
);

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
