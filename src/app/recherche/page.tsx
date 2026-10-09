import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OfferCard } from "@/components/offer-card";
import { listOffers } from "@/lib/queries";

const TYPES = [
  { value: "all", label: "Toutes" },
  { value: "stage", label: "Stages" },
  { value: "cdi-cdd", label: "CDI / CDD" },
  { value: "post-doc", label: "Post-doc" },
];

export const instant = false;

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q = "", type = "all" } = await searchParams;
  const results = await listOffers({ search: q || undefined, contractType: type });

  const buildHref = (t: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (t !== "all") p.set("type", t);
    return `/recherche?${p.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Recherche</h1>
      <p className="mb-6 text-sm text-muted-foreground">{results.length} résultat(s)</p>

      <form action="/recherche" method="get" className="mb-6 flex max-w-xl gap-2">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Intitulé, organisme, ville…"
          className="flex-1"
        />
        <input type="hidden" name="type" value={type} />
        <Button type="submit">
          <Search data-slot="icon" /> Rechercher
        </Button>
      </form>

      <div className="mb-8 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <Button
            key={t.value}
            asChild
            variant={t.value === type ? "default" : "outline"}
            size="sm"
          >
            <Link href={buildHref(t.value)}>{t.label}</Link>
          </Button>
        ))}
      </div>

      <Suspense>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
        {results.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            Aucune offre ne correspond à cette recherche.
          </p>
        )}
      </Suspense>
    </div>
  );
}
