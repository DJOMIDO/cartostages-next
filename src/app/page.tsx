import Link from "next/link";
import { MapPin, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfferCard } from "@/components/offer-card";
import { listOffers, getStats } from "@/lib/queries";

export const instant = false;

export default async function HomePage() {
  const [latest, stats] = await Promise.all([
    listOffers({ limit: 8 }),
    getStats(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-16 sm:py-24 text-center">
        <p className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
          Source : offres TAL/NLP du laboratoire ERSS (Toulouse)
        </p>
        <h1 className="mx-auto max-w-2xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Les offres de stage en{" "}
          <span className="text-[#e84f10]">TAL / NLP</span>, sur une carte
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          Stages, CDI/CDD et post-docs en traitement automatique des langues en
          France, collectés et géolocalisés automatiquement.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/carte">
              <MapPin data-slot="icon" /> Voir la carte
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/recherche">
              <Search data-slot="icon" /> Rechercher
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 pb-12 sm:grid-cols-4">
        {[
          { label: "Offres actives", value: stats.total },
          { label: "Stages", value: stats.stages },
          { label: "Villes", value: stats.cities },
          { label: "Organismes", value: stats.orgs },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Dernières offres</h2>
          <Button asChild variant="ghost">
            <Link href="/recherche">
              Tout voir <ArrowRight data-slot="icon" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>
    </div>
  );
}
