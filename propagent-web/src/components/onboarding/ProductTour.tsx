"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X, Sparkles } from "lucide-react";
import { setTourDone } from "@/lib/onboarding";

export interface TourStep {
  /** CSS selector the step should highlight. Falls back to a centered modal. */
  target?: string;
  title: string;
  description: string;
  /** Preferred placement relative to the target. Auto-adjusts if off-screen. */
  placement?: "top" | "bottom" | "left" | "right" | "center";
}

interface ProductTourProps {
  steps: TourStep[];
  open: boolean;
  onClose: (finished: boolean) => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const POPOVER_WIDTH = 320;
const POPOVER_MARGIN = 12;

function getTargetRect(selector?: string): Rect | null {
  if (!selector || typeof document === "undefined") return null;
  const el = document.querySelector(selector);
  if (!(el instanceof HTMLElement)) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function computePopoverPosition(
  rect: Rect | null,
  placement: TourStep["placement"],
): { top: number; left: number; arrow: "top" | "bottom" | "left" | "right" | null } {
  if (typeof window === "undefined" || !rect) {
    return {
      top:
        typeof window === "undefined"
          ? 120
          : Math.max(24, window.innerHeight / 2 - 140),
      left:
        typeof window === "undefined"
          ? 120
          : Math.max(24, window.innerWidth / 2 - POPOVER_WIDTH / 2),
      arrow: null,
    };
  }

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const desired = placement ?? "bottom";

  const candidates: Array<"top" | "bottom" | "left" | "right"> =
    desired === "center"
      ? ["bottom", "top", "right", "left"]
      : [desired as "top" | "bottom" | "left" | "right", "bottom", "top", "right", "left"];

  for (const p of candidates) {
    let top = 0;
    let left = 0;
    switch (p) {
      case "bottom":
        top = rect.top + rect.height + POPOVER_MARGIN;
        left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
        break;
      case "top":
        top = rect.top - POPOVER_MARGIN - 180;
        left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
        break;
      case "right":
        top = rect.top + rect.height / 2 - 90;
        left = rect.left + rect.width + POPOVER_MARGIN;
        break;
      case "left":
        top = rect.top + rect.height / 2 - 90;
        left = rect.left - POPOVER_MARGIN - POPOVER_WIDTH;
        break;
    }

    const fits =
      top >= 16 &&
      top + 160 <= viewportH - 16 &&
      left >= 16 &&
      left + POPOVER_WIDTH <= viewportW - 16;

    if (fits) {
      return { top, left, arrow: p };
    }
  }

  // Fallback: center of screen, no arrow
  return {
    top: Math.max(24, viewportH / 2 - 140),
    left: Math.max(24, viewportW / 2 - POPOVER_WIDTH / 2),
    arrow: null,
  };
}

export function ProductTour({ steps, open, onClose }: ProductTourProps) {
  const [mounted, setMounted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tick, setTick] = useState(0);

  const step = steps[stepIndex];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset to first step whenever the tour (re)opens.
  useEffect(() => {
    if (open) {
      setStepIndex(0);
    }
  }, [open]);

  // Scroll the target into view + recompute rect whenever the step changes.
  useLayoutEffect(() => {
    if (!open || !step) return;
    const targetEl = step.target
      ? (document.querySelector(step.target) as HTMLElement | null)
      : null;
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const next = getTargetRect(step.target);
    setRect(next);
  }, [open, step, tick]);

  // Recompute on resize / scroll so the popover tracks the target.
  useEffect(() => {
    if (!open) return;
    const handler = () => setTick((t) => t + 1);
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    const interval = window.setInterval(handler, 400);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
      window.clearInterval(interval);
    };
  }, [open]);

  const finish = useCallback(() => {
    setTourDone(true);
    onClose(true);
  }, [onClose]);

  const skip = useCallback(() => {
    setTourDone(true);
    onClose(false);
  }, [onClose]);

  // Keyboard controls
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
      if (e.key === "ArrowRight") {
        setStepIndex((i) => Math.min(i + 1, steps.length - 1));
      }
      if (e.key === "ArrowLeft") {
        setStepIndex((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, skip, steps.length]);

  if (!mounted || !open || !step) return null;

  const isLast = stepIndex === steps.length - 1;
  const isFirst = stepIndex === 0;
  const popover = computePopoverPosition(rect, step.placement);

  const spotlight = rect
    ? {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      }
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-step-title"
    >
      {/* Backdrop with spotlight cutout using an SVG mask */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        onClick={skip}
        aria-hidden="true"
      >
        <defs>
          <mask id="tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx={12}
                ry={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(10, 10, 10, 0.72)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Highlight ring around the target */}
      {spotlight && (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-lime-400 ring-offset-2 ring-offset-transparent animate-pulse"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
        />
      )}

      {/* Popover card */}
      <div
        className="absolute bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 text-charcoal-900 pointer-events-auto"
        style={{
          top: popover.top,
          left: popover.left,
          width: POPOVER_WIDTH,
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-lime-400 text-charcoal-900">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-medium text-charcoal-500">
              Step {stepIndex + 1} of {steps.length}
            </span>
          </div>
          <button
            type="button"
            onClick={skip}
            aria-label="Skip tour"
            className="p-1 rounded-full text-charcoal-500 hover:bg-gray-100 hover:text-charcoal-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3
          id="tour-step-title"
          className="text-lg font-semibold text-charcoal-900"
        >
          {step.title}
        </h3>
        <p className="text-sm text-charcoal-600 mt-1.5 leading-relaxed">
          {step.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={skip}
            className="text-xs text-charcoal-500 hover:text-charcoal-800 underline-offset-2 hover:underline cursor-pointer"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={() => setStepIndex((i) => Math.max(i - 1, 0))}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium text-charcoal-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                isLast
                  ? finish()
                  : setStepIndex((i) => Math.min(i + 1, steps.length - 1))
              }
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold bg-charcoal-900 text-white hover:bg-charcoal-800 transition-colors cursor-pointer"
            >
              {isLast ? "Finish" : "Next"}
              {!isLast && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
