"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SyncButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [report, setReport] = useState<string | null>(null);

  async function sync() {
    setState("running");
    setReport(null);
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setState("done");
        setReport(`${data.inserted} nouvelles, ${data.updated} mises à jour, ${data.unchanged} inchangées`);
        router.refresh();
      } else {
        setState("idle");
        setReport(`Échec : ${data.error ?? res.status}`);
      }
    } catch (e) {
      setState("idle");
      setReport(`Erreur réseau : ${e}`);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {report && <span className="text-sm text-muted-foreground">{report}</span>}
      <Button onClick={sync} disabled={state === "running"}>
        <RefreshCw data-slot="icon" className={state === "running" ? "animate-spin" : ""} />
        {state === "running" ? "Synchronisation…" : "Synchroniser WAGA"}
      </Button>
    </div>
  );
}
