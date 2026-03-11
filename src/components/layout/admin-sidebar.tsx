"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

type Props = {
  locale: string;
  userName: string;
};

const navItems = [
  {
    href: "/admin",
    labelHe: "לוח בקרה",
    labelEn: "Dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/admin/events",
    labelHe: "אירועים",
    labelEn: "Events",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/admin/magazine",
    labelHe: "מגזין",
    labelEn: "Magazine",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/updates",
    labelHe: "עדכונים",
    labelEn: "Updates",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/admin/gallery",
    labelHe: "גלריה",
    labelEn: "Gallery",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    href: "/admin/submissions",
    labelHe: "פניות",
    labelEn: "Submissions",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    href: "/admin/home",
    labelHe: "עמוד הבית",
    labelEn: "Home Settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

export function AdminSidebar({ locale, userName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isHebrew = locale === "he";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    const localePath = isHebrew ? href : `/en${href}`;
    if (href === "/admin") {
      return pathname === localePath || pathname === href;
    }
    return pathname.startsWith(localePath) || pathname.startsWith(href);
  }

  return (
    <aside className="w-64 bg-white border-e border-branch/10 flex flex-col shrink-0">
      {/* User info */}
      <div className="p-4 border-b border-branch/10">
        <p className="text-sm font-medium text-navy truncate">{userName}</p>
        <p className="text-xs text-ink-muted">
          {isHebrew ? "מנהל" : "Administrator"}
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${
                isActive(item.href)
                  ? "bg-navy/5 text-navy"
                  : "text-ink-light hover:text-navy hover:bg-navy/5"
              }
            `}
          >
            <span className="shrink-0 opacity-70">{item.icon}</span>
            {isHebrew ? item.labelHe : item.labelEn}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-branch/10">
        <button
          onClick={handleLogout}
          className="
            flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
            text-error/70 hover:text-error hover:bg-error/5 transition-colors
          "
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-70"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {isHebrew ? "יציאה" : "Logout"}
        </button>
      </div>
    </aside>
  );
}
