"use client";

import clsx from "clsx";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

const FOCUSABLE_ELEMENT_SELECTOR =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

interface SlidingViewProps {
  views: Record<string, ReactNode>;
  currentView: string;
  autoFocus?: boolean;
}

export function SlidingView({
  views,
  currentView,
  autoFocus,
}: SlidingViewProps) {
  const [height, setHeight] = useState<number | "auto">("auto");

  const viewKeys = Object.keys(views);
  const currentViewIndex = viewKeys.indexOf(currentView);

  const viewRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const currentViewRef = viewRefs.current[currentViewIndex];
    if (currentViewRef) {
      setHeight(currentViewRef.scrollHeight);
    }
  }, [currentView, currentViewIndex]);

  useLayoutEffect(() => {
    if (!autoFocus) return;

    const currentViewRef = viewRefs.current[currentViewIndex];
    if (currentViewRef) {
      // Focus the first focusable element within the newly active view
      currentViewRef
        .querySelector<HTMLElement>(FOCUSABLE_ELEMENT_SELECTOR)
        ?.focus({ preventScroll: true });
    }
  }, [autoFocus, currentView, currentViewIndex]);

  return (
    <div
      className="h-[var(--height)] overflow-hidden transition-[height] duration-300 ease-in-out"
      style={{ "--height": height } as React.CSSProperties}
    >
      <div
        className="grid -translate-x-[calc(var(--current-view)*100%)] grid-cols-[repeat(var(--views),100%)] transition-transform duration-300 ease-in-out"
        style={
          {
            "--views": viewKeys.length,
            "--current-view": currentViewIndex,
          } as React.CSSProperties
        }
      >
        {viewKeys.map((key, index) => (
          <div
            key={key}
            ref={(el) => {
              viewRefs.current[index] = el;
            }}
            className={clsx(
              "transition-opacity duration-300 ease-out",
              key !== currentView && "opacity-0",
            )}
            inert={key !== currentView}
            data-testid={`view-${index + 1}`}
          >
            {views[key]}
          </div>
        ))}
      </div>
    </div>
  );
}
