"use client";

import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SessionBadge() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div className="w-24" />;

  if (!session) {
    return (
      <Button asChild size="sm" variant="ghost" className="text-muted-foreground">
        <Link href="/login">Connexion</Link>
      </Button>
    );
  }

  const isAdmin = session.user.role === "admin";

  return (
    <div className="flex items-center gap-1">
      {isAdmin && (
        <Button asChild size="sm" variant="ghost" className="text-muted-foreground">
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      <span className="hidden max-w-32 truncate text-sm text-muted-foreground sm:inline">
        {session.user.name}
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="text-muted-foreground"
        onClick={() => signOut({ redirectTo: "/" })}
      >
        Déconnexion
      </Button>
    </div>
  );
}
