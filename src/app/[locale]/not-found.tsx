import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-navy/20 mb-4">404</h1>
      <p className="text-lg text-ink-muted mb-8">
        הדף לא נמצא / Page not found
      </p>
      <Link
        href="/"
        className="
          px-6 py-3 rounded-full bg-navy text-parchment font-medium
          hover:bg-navy-light transition-colors
        "
      >
        חזרה לדף הבית / Back Home
      </Link>
    </div>
  );
}
