import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboard({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  const supabase = await createClient();

  // Fetch stats
  const [
    { count: eventsCount },
    { count: articlesCount },
    { count: registrationsCount },
    { count: unreadSubmissions },
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("event_registrations").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false),
  ]);

  const stats = [
    {
      labelHe: "אירועים",
      labelEn: "Events",
      value: eventsCount || 0,
      href: "/admin/events",
      color: "bg-branch/10 text-branch",
    },
    {
      labelHe: "מאמרים",
      labelEn: "Articles",
      value: articlesCount || 0,
      href: "/admin/magazine",
      color: "bg-terracotta/10 text-terracotta",
    },
    {
      labelHe: "נרשמים",
      labelEn: "Registrations",
      value: registrationsCount || 0,
      href: "/admin/events",
      color: "bg-green/10 text-green",
    },
    {
      labelHe: "פניות חדשות",
      labelEn: "New Messages",
      value: unreadSubmissions || 0,
      href: "/admin/submissions",
      color: "bg-navy/10 text-navy",
    },
  ];

  return (
    <div>
      <h1
        className={`
          text-2xl md:text-3xl font-bold text-navy mb-8
          ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}
        `}
      >
        {isHebrew ? "לוח בקרה" : "Dashboard"}
      </h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.labelEn}
            href={stat.href}
            className="bg-white rounded-xl p-5 border border-branch/5 hover-lift"
          >
            <p className="text-sm text-ink-muted mb-1">
              {isHebrew ? stat.labelHe : stat.labelEn}
            </p>
            <p className="text-3xl font-bold text-navy">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2
        className={`
          text-lg font-semibold text-navy mb-4
          ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}
        `}
      >
        {isHebrew ? "פעולות מהירות" : "Quick Actions"}
      </h2>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/events/new"
          className="
            inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
            bg-navy text-parchment font-medium text-sm
            hover:bg-navy-light transition-colors
          "
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {isHebrew ? "אירוע חדש" : "New Event"}
        </Link>
        <Link
          href="/admin/magazine/new"
          className="
            inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
            bg-terracotta text-white font-medium text-sm
            hover:bg-terracotta-dark transition-colors
          "
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {isHebrew ? "מאמר חדש" : "New Article"}
        </Link>
        <Link
          href="/admin/updates/new"
          className="
            inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
            bg-white text-navy font-medium text-sm border border-navy/20
            hover:bg-navy/5 transition-colors
          "
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {isHebrew ? "עדכון חדש" : "New Update"}
        </Link>
      </div>
    </div>
  );
}
