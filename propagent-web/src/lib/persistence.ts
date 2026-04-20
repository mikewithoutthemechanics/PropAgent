"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Storage key prefix so we can version/clear if needed
const KEY_PREFIX = "propagent::v1::";

function storageKey(key: string) {
  return `${KEY_PREFIX}${key}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function readLocal<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`persistence: failed to read ${key}`, err);
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(value));
    // Fire a synthetic event so other hooks in the same tab update too.
    window.dispatchEvent(
      new CustomEvent("propagent:storage", { detail: { key } })
    );
  } catch (err) {
    console.warn(`persistence: failed to write ${key}`, err);
  }
}

export function removeLocal(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(storageKey(key));
    window.dispatchEvent(
      new CustomEvent("propagent:storage", { detail: { key } })
    );
  } catch (err) {
    console.warn(`persistence: failed to remove ${key}`, err);
  }
}

/**
 * SSR-safe persistent state hook. Starts with `defaultValue` on the server and
 * during initial hydration, then hydrates from localStorage on mount. Also
 * listens for changes in other tabs or via `writeLocal`.
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const hydrated = useRef(false);

  // Hydrate on mount
  useEffect(() => {
    const stored = readLocal<T | undefined>(key, undefined as unknown as T);
    if (stored !== undefined) {
      setValue(stored);
    }
    hydrated.current = true;
  }, [key]);

  // Listen for changes from other tabs / components
  useEffect(() => {
    if (!isBrowser()) return;
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey(key) && event.newValue) {
        try {
          setValue(JSON.parse(event.newValue) as T);
        } catch {
          /* ignore */
        }
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string }>).detail;
      if (detail?.key === key) {
        setValue(readLocal<T>(key, defaultValue));
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("propagent:storage", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "propagent:storage",
        onCustom as EventListener,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function"
            ? (next as (p: T) => T)(prev)
            : next;
        writeLocal(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update];
}

/**
 * Collection hook: manages a list of items keyed by `id` with CRUD helpers.
 * Seeds from `seed` the first time we encounter an unseeded collection.
 */
export function useCollection<T extends { id: string }>(
  key: string,
  seed: T[],
) {
  const [items, setItems] = useLocalStorageState<T[]>(key, seed);
  const seededRef = useRef(false);

  // Merge seed items on first hydration if they don't exist yet.
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const existing = readLocal<T[] | undefined>(key, undefined as never);
    if (existing === undefined) {
      writeLocal(key, seed);
      setItems(seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const add = useCallback(
    (item: T) => {
      setItems((prev) => [item, ...prev]);
    },
    [setItems],
  );

  const update = useCallback(
    (id: string, patch: Partial<T>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [setItems],
  );

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setItems],
  );

  const reset = useCallback(() => {
    setItems(seed);
  }, [seed, setItems]);

  return { items, setItems, add, update, remove, reset };
}

/** Generate a short unique id (for client-side records). */
export function newId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
