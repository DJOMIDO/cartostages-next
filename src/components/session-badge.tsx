"use client";

import Link from "next/link";
import { LogIn, UserRound } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SessionBadge({ compact = false }: { compact?: boolean }) {
  const { data: session, isPending } = useSession();

  if (isPending) return compact ? <div className="w-9" /> : <div className="w-24" />;

  if (!session) {
    return compact ? (
      <Button asChild size="icon" variant="ghost" className="text-[#00838f]">
        <Link href="/login" aria-label="Connexion">
          <LogIn className="size-4" />
        </Link>
      </Button>
    ) : (
      <Button asChild size="sm" variant="ghost" className="text-[#00838f]">
        <Link href="/login">Connexion</Link>
      </Button>
    );
  }

  const isAdmin = session.user.role === "admin";

  if (compact) {
    return (
      <div className="flex items-center">
        {isAdmin && (
          <Button asChild size="sm" variant="ghost" className="text-[#e84f10]">
            <Link href="/admin">Admin</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {isAdmin && (
        <Button asChild size="sm" variant="ghost" className="text-[#e84f10]">
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      <span className="hidden max-w-32 items-center gap-1 truncate text-sm text-muted-foreground sm:inline">
        <UserRound className="size-3.5" />
        {session.user.name}
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="text-muted-foreground"
        onClick={() => signOut({ callbackURL: "/" })}
      >
        Déconnexion
      </Button>
    </div>
  );
}
