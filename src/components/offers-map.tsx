"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapOffer } from "@/app/carte/page";

const OffersMapInner = dynamic(() => import("@/components/offers-map-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function OffersMap({ offers }: { offers: MapOffer[] }) {
  return <OffersMapInner offers={offers} />;
}
