"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

type ThemeState = { mode: ThemeMode; systemDark: boolean };

const SERVER_STATE: ThemeState = { mode: "system", systemDark: false };

function readState(): ThemeState {
  const stored = localStorage.getItem(STORAGE_KEY);
  const mode: ThemeMode =
    stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system";
  return {
    mode,
    systemDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
  };
}

function applyState({ mode, systemDark }: ThemeState) {
  document.documentElement.classList.toggle(
    "dark",
    mode === "dark" || (mode === "system" && systemDark),
  );
}

let state: ThemeState = SERVER_STATE;
let listeners: Set<() => void> | null = null;
let media: MediaQueryList | null = null;

function subscribe(onStoreChange: () => void) {
  if (!listeners) {
    state = readState();
    applyState(state);
    listeners = new Set();
    media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", (e) => {
      state = { ...state, systemDark: e.matches };
      applyState(state);
      listeners?.forEach((l) => l());
    });
  }
  listeners.add(onStoreChange);
  return () => listeners?.delete(onStoreChange);
}

function getSnapshot(): ThemeState {
  return state;
}

function setMode(next: ThemeMode) {
  state = { ...state, mode: next };
  localStorage.setItem(STORAGE_KEY, next);
  applyState(state);
  listeners?.forEach((l) => l());
}

const ThemeContext = createContext<{
  mode: ThemeMode;
  resolvedDark: boolean;
  setMode: (mode: ThemeMode) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => SERVER_STATE,
  );
  const set = useCallback((next: ThemeMode) => setMode(next), []);
  const value = useMemo(() => {
    const resolvedDark =
      snapshot.mode === "dark" ||
      (snapshot.mode === "system" && snapshot.systemDark);
    return { mode: snapshot.mode, resolvedDark, setMode: set };
  }, [snapshot, set]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
