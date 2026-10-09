import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CONTRACT_LABEL, formatDateFr } from "@/components/offer-card";
import { getOfferById } from "@/lib/queries";
import {
  fetchDescription,
  stripTitleDuplicates,
  type DescBlock,
  type ParsedDescription,
} from "@/lib/crawler/description";
import { cn } from "@/lib/utils";

export const instant = false;

type Params = { params: Promise<{ id: string }> };

async function loadOffer({ params }: Params) {
  const { id } = await params;
  const offer = await getOfferById(id);
  if (!offer) return null;
  let parsed: ParsedDescription | null = null;
  if (offer.descriptionUrl) {
    parsed = await fetchDescription(offer.descriptionUrl);
    if (parsed) stripTitleDuplicates(parsed, offer.title);
  }
  return { offer, parsed };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const offer = await getOfferById(id);
  if (!offer) return { title: "Offre introuvable" };
  return {
    title: `${offer.title} — CartoStages`,
    description: [offer.organization, offer.location].filter(Boolean).join(" · "),
  };
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/\S+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (/^https?:\/\//.test(p)) {
          return (
            <a
              key={i}
              href={p}
              target="_blank"
              rel="noreferrer"
              className="break-all text-[#00838f] underline underline-offset-2 hover:text-[#e84f10] dark:text-[#22a7b4]"
            >
              {p}
            </a>
          );
        }
        if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p)) {
          return (
            <a
              key={i}
              href={`mailto:${p}`}
              className="text-[#00838f] underline underline-offset-2 hover:text-[#e84f10] dark:text-[#22a7b4]"
            >
              {p}
            </a>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function Block({ block }: { block: DescBlock }) {
  if (block.type === "heading") {
    return (
      <h2 className="mt-9 mb-3 border-l-4 border-[#e84f10] pl-3 text-lg font-semibold tracking-tight">
        {block.text}
      </h2>
    );
  }
  if (block.type === "list") {
    return (
      <ul className="my-4 list-disc space-y-2 pl-5 marker:text-[#00838f]">
        {block.items.map((item, i) => (
          <li key={i} className="leading-7">
            <RichText text={item} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="my-4 leading-7 text-foreground/90">
      <RichText text={block.text} />
    </p>
  );
}

export default async function OfferDetailPage(props: Params) {
  const data = await loadOffer(props);
  if (!data) notFound();
  const { offer, parsed } = data;
  const contract = CONTRACT_LABEL[offer.contractType];
  const applyIdx = parsed
    ? parsed.links.findIndex((x) => /candidater|postuler|lien pour/i.test(x.label))
    : -1;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <Link
        href="/recherche"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-[#00838f]"
      >
        <ArrowLeft className="size-4" />
        Toutes les offres
      </Link>

      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={cn("border-0", contract.className)}>
            {contract.label}
          </Badge>
          {offer.postedAt && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {formatDateFr(offer.postedAt)}
            </span>
          )}
          {offer.archived && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Archivée
            </Badge>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {offer.title}
        </h1>
        <div className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground">
          {offer.organization && (
            <p className="flex items-center gap-2">
              <Building2 className="size-4 shrink-0 text-[#00838f] dark:text-[#22a7b4]" />
              {offer.organization}
            </p>
          )}
          {offer.location && (
            <p className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-[#00838f] dark:text-[#22a7b4]" />
              {offer.location}
            </p>
          )}
        </div>
      </header>

      {parsed && (parsed.fields.length > 0 || parsed.links.length > 0) && (
        <section className="mt-7 rounded-xl border bg-muted/40 p-5">
          {parsed.fields.length > 0 && (
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {parsed.fields.map((f, i) => (
                <div key={`${f.label}-${i}`}>
                  <dt className="text-[11px] font-semibold tracking-wider text-[#00838f] uppercase dark:text-[#22a7b4]">
                    {f.label}
                  </dt>
                  <dd className="mt-1 text-sm leading-snug">
                    <RichText text={f.value} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {parsed.links.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap items-center gap-2",
                parsed.fields.length > 0 && "mt-5 border-t pt-4",
              )}
            >
              {parsed.links.map((l, i) => {
                if (i === applyIdx) {
                  return (
                    <a
                      key={i}
                      href={l.value}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#e84f10] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                    >
                      Candidater
                      <ArrowUpRight className="size-4" />
                    </a>
                  );
                }
                return (
                  <a
                    key={i}
                    href={l.value}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium text-[#00838f] transition-colors hover:bg-[#00838f]/5 dark:text-[#22a7b4]"
                  >
                    {l.label}
                    <ExternalLink className="size-3.5" />
                  </a>
                );
              })}
            </div>
          )}
        </section>
      )}

      <article className="mt-8 text-[15px]">
        {parsed && parsed.blocks.length > 0 ? (
          parsed.blocks.map((b, i) => <Block key={i} block={b} />)
        ) : parsed ? (
          <p className="leading-7 text-muted-foreground">
            Cette offre ne contient pas de description structurée.
          </p>
        ) : offer.descriptionUrl ? (
          <Card className="flex flex-col items-start gap-2 p-5 text-sm">
            <p className="text-muted-foreground">
              La description détaillée n&apos;a pas pu être chargée — le serveur de l&apos;ERSS
              est peut-être temporairement indisponible.
            </p>
            <a
              href={offer.descriptionUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-[#00838f] hover:underline dark:text-[#22a7b4]"
            >
              Ouvrir la fiche originale
              <ExternalLink className="size-3.5" />
            </a>
          </Card>
        ) : (
          <p className="leading-7 text-muted-foreground">
            Cette offre n&apos;a pas de description détaillée.
          </p>
        )}
      </article>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
        <span>
          Source :{" "}
          <a
            href="http://w3.erss.univ-tlse2.fr/membre/tanguy/offres.html"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:text-[#00838f] hover:underline"
          >
            WAGA — ERSS Université Toulouse-Jean Jaurès
          </a>
        </span>
        {offer.descriptionUrl && (
          <a
            href={offer.descriptionUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline-offset-2 hover:text-[#00838f] hover:underline"
          >
            Fiche originale (.txt)
            <ExternalLink className="size-3" />
          </a>
        )}
      </footer>
    </div>
  );
}
