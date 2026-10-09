import Link from "next/link";
import { Building2, CalendarDays, MapPin, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Offer } from "@/lib/db/schema";

const CONTRACT_LABEL: Record<Offer["contractType"], { label: string; className: string }> = {
  stage: { label: "Stage", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100" },
  "cdi-cdd": { label: "CDI / CDD", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
  "post-doc": { label: "Post-doc", className: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100" },
};

export function formatDateFr(d: string | null) {
  if (!d) return null;
  const date = new Date(`${d}T00:00:00`);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function OfferCard({ offer }: { offer: Offer }) {
  const contract = CONTRACT_LABEL[offer.contractType];
  return (
    <Card className="flex flex-col gap-2 p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <Badge variant="secondary" className={contract.className}>
          {contract.label}
        </Badge>
        {offer.postedAt && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {formatDateFr(offer.postedAt)}
          </span>
        )}
      </div>
      <Link
        href={offer.descriptionUrl ?? "#"}
        target={offer.descriptionUrl ? "_blank" : undefined}
        className="line-clamp-3 font-medium text-balance underline-offset-4 hover:underline"
      >
        {offer.title}
      </Link>
      <div className="mt-auto space-y-1 text-sm text-muted-foreground">
        <p className="flex items-center gap-1.5 truncate">
          <Building2 className="size-3.5 shrink-0" />
          {offer.organization}
        </p>
        {offer.location && (
          <p className="flex items-center gap-1.5 truncate">
            <MapPin className="size-3.5 shrink-0" />
            {offer.location}
          </p>
        )}
        {offer.descriptionUrl && (
          <p className="flex items-center gap-1.5">
            <FileText className="size-3.5 shrink-0" />
            Description détaillée
          </p>
        )}
      </div>
    </Card>
  );
}
