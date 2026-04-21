"use client";

import { useCallback, useEffect, useState } from "react";

// Storage keys for the new-user onboarding journey. These keys are NEW
// (intentionally separate from the legacy `propagent-*` namespace) so
// behavior is clean for future installs without affecting existing users.
const ONBOARDING_KEY = "agentping-onboarded";
const TOUR_KEY = "agentping-tour-complete";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readFlag(key: string): boolean {
  if (!isBrowser()) return false;
  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean): void {
  if (!isBrowser()) return;
  try {
    if (value) {
      window.localStorage.setItem(key, "true");
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

export function isOnboardingDone(): boolean {
  return readFlag(ONBOARDING_KEY);
}

export function setOnboardingDone(done: boolean): void {
  writeFlag(ONBOARDING_KEY, done);
}

export function isTourDone(): boolean {
  return readFlag(TOUR_KEY);
}

export function setTourDone(done: boolean): void {
  writeFlag(TOUR_KEY, done);
}

export function resetOnboarding(): void {
  setOnboardingDone(false);
  setTourDone(false);
}

/**
 * Hook returning the current onboarding + tour flags. Hydrates from
 * localStorage after mount to stay SSR-safe.
 */
export function useOnboardingState() {
  const [onboarded, setOnboarded] = useState(false);
  const [tourComplete, setTourComplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOnboarded(isOnboardingDone());
    setTourComplete(isTourDone());
    setHydrated(true);
  }, []);

  const markOnboarded = useCallback(() => {
    setOnboardingDone(true);
    setOnboarded(true);
  }, []);

  const markTourComplete = useCallback(() => {
    setTourDone(true);
    setTourComplete(true);
  }, []);

  const restartTour = useCallback(() => {
    setTourDone(false);
    setTourComplete(false);
  }, []);

  return {
    hydrated,
    onboarded,
    tourComplete,
    markOnboarded,
    markTourComplete,
    restartTour,
  };
}
