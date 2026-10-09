import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, FileText, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Offer } from "@/lib/db/schema";

export const CONTRACT_LABEL: Record<Offer["contractType"], { label: string; className: string }> = {
  stage: { label: "Stage", className: "bg-[#00838f]/10 text-[#00838f] dark:bg-[#22a7b4]/20 dark:text-[#22a7b4]" },
  "cdi-cdd": { label: "CDI / CDD", className: "bg-[#e84f10]/10 text-[#e84f10] dark:bg-[#e84f10]/25 dark:text-[#ff8a55]" },
  "post-doc": { label: "Post-doc", className: "bg-[#1e2d4d]/10 text-[#1e2d4d] dark:bg-zinc-700 dark:text-zinc-200" },
};

export function formatDateFr(d: string | null) {
  if (!d) return null;
  const date = new Date(`${d}T00:00:00`);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function OfferCard({ offer }: { offer: Offer }) {
  const contract = CONTRACT_LABEL[offer.contractType];
  return (
    <Link href={`/offre/${offer.id}`} className="group block h-full">
      <Card className="flex h-full flex-col gap-2 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
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
        <p className="line-clamp-3 font-medium text-balance underline-offset-4 group-hover:text-[#00838f] group-hover:underline dark:group-hover:text-[#22a7b4]">
          {offer.title}
        </p>
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
        </div>
        <p className="flex items-center gap-1.5 pt-1 text-xs font-medium text-[#00838f] dark:text-[#22a7b4]">
          <FileText className="size-3.5 shrink-0" />
          Lire la fiche détaillée
          <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </p>
      </Card>
    </Link>
  );
}
