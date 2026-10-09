"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Badge } from "@/components/ui/badge";
import { formatDateFr } from "@/components/offer-card";
import type { MapOffer } from "@/app/carte/page";

const COLORS: Record<string, string> = {
  stage: "#10b981",
  "cdi-cdd": "#3b82f6",
  "post-doc": "#8b5cf6",
};

function iconFor(type: string) {
  const c = COLORS[type] ?? "#64748b";
  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40"><path fill="${c}" stroke="white" stroke-width="1.5" d="M14 1C6.8 1 1 6.8 1 14c0 9.2 11.2 23.2 12.5 24.6a1 1 0 0 0 1 0C15.8 37.2 27 23.2 27 14 27 6.8 21.2 1 14 1z"/><circle cx="14" cy="14" r="5" fill="white"/></svg>`,
    iconSize: [28, 40],
    iconAnchor: [14, 38],
    popupAnchor: [0, -34],
  });
}

export default function OffersMapInner({ offers }: { offers: MapOffer[] }) {
  return (
    <MapContainer
      center={[46.55, 2.6]}
      zoom={6}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "#e2e8f0" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {offers.map((o) => (
        <Marker key={o.id} position={[o.lat!, o.lng!]} icon={iconFor(o.contractType)}>
          <Popup>
            <div className="space-y-1.5 py-1">
              <Badge
                className="border-0"
                style={{ backgroundColor: `${COLORS[o.contractType]}20`, color: COLORS[o.contractType] }}
              >
                {o.contractType === "stage" ? "Stage" : o.contractType === "post-doc" ? "Post-doc" : "CDI / CDD"}
              </Badge>
              <p className="max-w-64 font-medium leading-snug">{o.title}</p>
              <p className="text-sm">{o.organization}</p>
              {o.location && <p className="text-sm text-neutral-500">{o.location}</p>}
              <div className="flex items-center justify-between pt-1 text-xs text-neutral-500">
                <span>{formatDateFr(o.postedAt)}</span>
                {o.descriptionUrl && (
                  <a
                    href={o.descriptionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Détails →
                  </a>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
