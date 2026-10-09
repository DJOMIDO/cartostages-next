import Link from "next/link";
import { MapPin, Search, GraduationCap } from "lucide-react";
import { SessionBadge } from "@/components/session-badge";

const NAV = [
  { href: "/", label: "Accueil", icon: GraduationCap },
  { href: "/carte", label: "Carte", icon: MapPin },
  { href: "/recherche", label: "Recherche", icon: Search },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="size-4" />
          </span>
          <span>
            Carto<span className="text-primary">Stages</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          <SessionBadge />
        </nav>
      </div>
    </header>
  );
}
