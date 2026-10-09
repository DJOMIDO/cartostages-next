"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useHydrated,
  useTheme,
  type ThemeMode,
} from "@/components/theme-provider";

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const LABEL: Record<ThemeMode, string> = {
  light: "Mode jour",
  dark: "Mode nuit",
  system: "Suivre le système",
};

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, resolvedDark, setMode } = useTheme();
  const hydrated = useHydrated();

  const Icon = mode === "system" ? Laptop : resolvedDark ? Moon : Sun;

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      suppressHydrationWarning
      className={className}
      style={{ visibility: hydrated ? undefined : "hidden" }}
      aria-label={
        hydrated
          ? `Thème : ${LABEL[mode]} — cliquer pour changer`
          : "Chargement du thème"
      }
      onClick={() => setMode(NEXT_MODE[mode])}
    >
      {hydrated && <Icon className="size-4" />}
    </Button>
  );
}
