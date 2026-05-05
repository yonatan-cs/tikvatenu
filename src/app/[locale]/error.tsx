"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 mb-6 rounded-full bg-error/10 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-navy mb-2">אירעה שגיאה</h2>
      <p className="text-ink-muted mb-6">משהו השתבש. אנא נסו שוב.</p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-full bg-navy text-parchment font-medium hover:bg-navy-light transition-colors"
      >
        נסו שוב
      </button>
    </div>
  );
}
