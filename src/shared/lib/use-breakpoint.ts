"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Адаптивные хуки приложения. Брейкпоинты совпадают с дефолтными значениями
 * Tailwind v4 (`--breakpoint-*`), чтобы JS-логика и CSS-классы оставались
 * единым источником правды. Любая правка значений должна дублироваться в
 * globals.css.
 *
 * SSR-safe: на сервере и на первом клиентском рендере возвращается
 * детерминированный `serverDefault`, реальное значение применяется в
 * `useSyncExternalStore` после монтирования — без hydration mismatch.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = "base" | keyof typeof BREAKPOINTS;

/** Имя наибольшего подходящего брейкпоинта для ширины. */
function widthToBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "base";
}

/* ── Базовый media-query хук ───────────────────────────────────────────── */

/**
 * Подписка на CSS media-запрос. На SSR/первом рендере возвращает
 * `serverDefault` (по умолчанию false), чтобы разметка сервера и клиента
 * совпадала; реальное значение применяется после монтирования.
 */
export function useMediaQuery(query: string, serverDefault = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () =>
      typeof window === "undefined"
        ? serverDefault
        : window.matchMedia(query).matches,
    [query, serverDefault],
  );

  const getServerSnapshot = useCallback(() => serverDefault, [serverDefault]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ── Брейкпоинт-хуки ───────────────────────────────────────────────────── */

/**
 * Текущее имя брейкпоинта Tailwind. На SSR/первом рендере возвращает
 * `serverDefault` ("base" — mobile-first, безопасно для самого узкого layout).
 */
export function useBreakpoint(serverDefault: Breakpoint = "base"): Breakpoint {
  const subscribe = useCallback((onChange: () => void) => {
    if (typeof window === "undefined") return () => {};
    const mqls = Object.values(BREAKPOINTS).map((px) =>
      window.matchMedia(`(min-width: ${px}px)`),
    );
    mqls.forEach((m) => m.addEventListener("change", onChange));
    return () => mqls.forEach((m) => m.removeEventListener("change", onChange));
  }, []);

  const getSnapshot = useCallback((): Breakpoint => {
    if (typeof window === "undefined") return serverDefault;
    return widthToBreakpoint(window.innerWidth);
  }, [serverDefault]);

  const getServerSnapshot = useCallback(() => serverDefault, [serverDefault]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Текущая ширина вьюпорта в px (0 на SSR/первом рендере). */
export function useViewportWidth(): number {
  const subscribe = useCallback((onChange: () => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("resize", onChange);
    return () => window.removeEventListener("resize", onChange);
  }, []);

  const getSnapshot = useCallback(
    () => (typeof window === "undefined" ? 0 : window.innerWidth),
    [],
  );

  const getServerSnapshot = useCallback(() => 0, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** true ниже брейкпоинта `md` (768px) — телефоны / маленькие планшеты. */
export function useIsMobile(serverDefault = false): boolean {
  return !useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`, !serverDefault);
}

/** Удобный хелпер: ширина ≥ названного брейкпоинта (mobile-first). */
export function useMinWidth(bp: keyof typeof BREAKPOINTS): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[bp]}px)`);
}
