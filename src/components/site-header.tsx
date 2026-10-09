"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Search, GraduationCap, Menu, X } from "lucide-react";
import { SessionBadge } from "@/components/session-badge";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Accueil", icon: GraduationCap },
  { href: "/carte", label: "Carte", icon: MapPin },
  { href: "/recherche", label: "Recherche", icon: Search },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-[#e84f10] font-medium text-white"
          : "text-[#1e2d4d] hover:bg-[#00838f]/10 hover:text-[#00838f] dark:text-zinc-200 dark:hover:text-[#22a7b4]"
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-[#00838f] text-white">
            <MapPin className="size-4" />
          </span>
          <span className="text-[#1e2d4d] dark:text-zinc-100">
            Carto<span className="text-[#00838f]">Stages</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
          <SessionBadge />
        </nav>

        {/* Mobile: session + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <SessionBadge compact />
          <button
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-md text-[#1e2d4d] hover:bg-muted dark:text-zinc-200"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <nav className="absolute inset-x-0 top-full border-b bg-background shadow-lg md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
              {NAV.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  active={isActive(item.href)}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
