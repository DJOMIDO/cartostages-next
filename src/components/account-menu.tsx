"use client";

import Link from "next/link";
import {
  ChevronsUpDown,
  LogIn,
  LogOut,
  Shield,
} from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function MenuLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

function MenuItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function AccountMenu() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div className="size-8 animate-pulse rounded-full bg-muted" />;

  if (!session) {
    return (
      <Button asChild size="sm" variant="ghost" className="text-[#00838f] dark:text-[#22a7b4]">
        <Link href="/login">
          <LogIn className="size-4" />
          <span className="hidden sm:inline">Connexion</span>
        </Link>
      </Button>
    );
  }

  const isAdmin = session.user.role === "admin";
  const initial = (session.user.name ?? session.user.email).trim().charAt(0).toUpperCase();

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 px-2 text-[#1e2d4d] hover:bg-[#00838f]/10 dark:text-zinc-200 dark:hover:bg-[#22a7b4]/10"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#00838f] text-xs font-semibold text-white dark:bg-[#22a7b4] dark:text-[#0b1e20]">
            {initial}
          </span>
          <span className="hidden max-w-28 truncate sm:inline">{session.user.name}</span>
          <ChevronsUpDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="flex items-center gap-2.5 px-2 py-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#00838f] text-sm font-semibold text-white dark:bg-[#22a7b4] dark:text-[#0b1e20]">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{session.user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
            </div>
          </div>

          <DropdownMenuPrimitive.Separator className="my-1 h-px bg-border" />

          <MenuLabel>
            {isAdmin ? "Administrateur" : "Utilisateur"}
          </MenuLabel>

          {isAdmin && (
            <MenuItem asChild>
              <Link href="/admin">
                <Shield className="size-4 text-[#e84f10]" />
                Administration
              </Link>
            </MenuItem>
          )}

          <DropdownMenuPrimitive.Separator className="my-1 h-px bg-border" />

          <MenuItem
            className="text-muted-foreground data-[highlighted]:text-foreground"
            onSelect={() => signOut({ callbackURL: "/" })}
          >
            <LogOut className="size-4" />
            Déconnexion
          </MenuItem>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
