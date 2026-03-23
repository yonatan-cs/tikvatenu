"use client";

import { useState, useEffect } from "react";

type A11yState = {
  largeText: boolean;
  highContrast: boolean;
  highlightLinks: boolean;
  noAnimations: boolean;
};

const DEFAULT_STATE: A11yState = {
  largeText: false,
  highContrast: false,
  highlightLinks: false,
  noAnimations: false,
};

const CLASS_MAP: Record<keyof A11yState, string> = {
  largeText: "a11y-large-text",
  highContrast: "a11y-high-contrast",
  highlightLinks: "a11y-highlight-links",
  noAnimations: "a11y-no-animations",
};

function applyClasses(state: A11yState) {
  const html = document.documentElement;
  for (const [key, cls] of Object.entries(CLASS_MAP)) {
    html.classList.toggle(cls, state[key as keyof A11yState]);
  }
}

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(DEFAULT_STATE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("a11y");
      if (saved) {
        const parsed: A11yState = { ...DEFAULT_STATE, ...JSON.parse(saved) };
        setState(parsed);
        applyClasses(parsed);
      }
    } catch {}
  }, []);

  function toggle(key: keyof A11yState) {
    setState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      applyClasses(next);
      localStorage.setItem("a11y", JSON.stringify(next));
      return next;
    });
  }

  function reset() {
    setState(DEFAULT_STATE);
    applyClasses(DEFAULT_STATE);
    localStorage.removeItem("a11y");
  }

  const options: { key: keyof A11yState; label: string; icon: string }[] = [
    { key: "largeText", label: "הגדלת טקסט", icon: "א" },
    { key: "highContrast", label: "ניגודיות גבוהה", icon: "◐" },
    { key: "highlightLinks", label: "הדגשת קישורים", icon: "🔗" },
    { key: "noAnimations", label: "עצירת אנימציות", icon: "⏸" },
  ];

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="תפריט נגישות"
        aria-expanded={open}
        aria-haspopup="true"
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-navy text-white shadow-lg flex items-center justify-center text-xl hover:bg-navy-light focus-visible:outline-2 focus-visible:outline-branch transition-colors"
      >
        ♿
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="אפשרויות נגישות"
          className="fixed bottom-20 left-6 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-56 flex flex-col gap-2"
          dir="rtl"
        >
          <p className="text-sm font-bold text-navy border-b border-gray-100 pb-2 mb-1">
            נגישות
          </p>

          {options.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              aria-pressed={state[key]}
              className={`flex items-center gap-3 text-sm px-3 py-2 rounded-lg text-right w-full transition-colors ${
                state[key]
                  ? "bg-navy text-white"
                  : "bg-gray-50 text-ink hover:bg-gray-100"
              }`}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              <span className="flex-1">{label}</span>
              {state[key] && <span className="text-xs opacity-75">פעיל</span>}
            </button>
          ))}

          <button
            onClick={reset}
            className="mt-1 text-xs text-ink-muted hover:text-ink underline text-right"
          >
            איפוס הגדרות
          </button>
        </div>
      )}
    </>
  );
}
