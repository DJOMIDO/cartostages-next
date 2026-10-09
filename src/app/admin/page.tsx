import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-utils";
import { OfferAdminTable } from "@/components/offer-admin-table";
import { SyncButton } from "@/components/sync-button";
import { listAllForAdmin } from "@/lib/queries";

export const instant = false;

export default async function AdminPage() {
  const session = await requireAdmin();
  if (!session) redirect("/login");

  const all = await listAllForAdmin();
  const active = all.filter((o) => !o.archived);
  const archived = all.filter((o) => o.archived);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
          <p className="text-sm text-muted-foreground">
            {active.length} offres actives, {archived.length} archivées
          </p>
        </div>
        <SyncButton />
      </div>
      <OfferAdminTable offers={all} />
    </div>
  );
}
