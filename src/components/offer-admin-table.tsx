"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Archive, ArchiveRestore, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateFr } from "@/components/offer-card";
import type { Offer } from "@/lib/db/schema";

export function OfferAdminTable({ offers }: { offers: Offer[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showArchived, setShowArchived] = useState(false);

  const visible = offers.filter((o) => (showArchived ? o.archived : !o.archived));

  async function toggleArchive(id: string, archived: boolean) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/offers/${id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      if (res.ok) router.refresh();
      else alert("Échec de la mise à jour");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={showArchived ? "outline" : "default"}
          onClick={() => setShowArchived(false)}
        >
          Actives ({offers.filter((o) => !o.archived).length})
        </Button>
        <Button
          size="sm"
          variant={showArchived ? "default" : "outline"}
          onClick={() => setShowArchived(true)}
        >
          Archivées ({offers.filter((o) => o.archived).length})
        </Button>
      </div>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Offre</TableHead>
              <TableHead className="hidden md:table-cell">Organisme</TableHead>
              <TableHead className="hidden md:table-cell">Lieu</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDateFr(o.postedAt)}
                </TableCell>
                <TableCell className="max-w-80">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={o.descriptionUrl ?? "#"}
                      target="_blank"
                      className="truncate font-medium hover:underline"
                    >
                      {o.title}
                    </Link>
                    {o.descriptionUrl && (
                      <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-40 truncate md:table-cell">
                  {o.organization}
                </TableCell>
                <TableCell className="hidden max-w-36 truncate md:table-cell text-muted-foreground">
                  {o.location}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{o.contractType}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => toggleArchive(o.id, !o.archived)}
                    title={o.archived ? "Réactiver" : "Archiver"}
                  >
                    {o.archived ? (
                      <ArchiveRestore className="size-4" />
                    ) : (
                      <Archive className="size-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Aucune offre dans cette catégorie.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
