import { listOffers } from "@/lib/queries";
import OffersMap from "@/components/offers-map";
import type { Offer } from "@/lib/db/schema";

export const instant = false;

export default async function CartePage() {
  const all = await listOffers();
  const geo = all.filter((o) => o.lat != null && o.lng != null);

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-6xl flex-col px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Carte des offres</h1>
        <p className="text-sm text-muted-foreground">
          {geo.length} offres géolocalisées sur {all.length} actives
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border shadow-sm">
        <OffersMap offers={geo} />
      </div>
    </div>
  );
}

export type MapOffer = Pick<
  Offer,
  "id" | "title" | "organization" | "location" | "contractType" | "lat" | "lng" | "descriptionUrl" | "postedAt"
>;
