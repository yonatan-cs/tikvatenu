"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";
import Image from "next/image";

const navItems = [
  { href: "/", labelKey: "home" },
  { href: "/about", labelKey: "about" },
  { href: "/events", labelKey: "events" },
  { href: "/magazine", labelKey: "magazine" },
  { href: "/join", labelKey: "join" },
  { href: "/yehonatan", labelKey: "deutsch" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHebrew = locale === "he";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header
      className="relative z-50 bg-cream border-b border-branch/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <Image
              src="/images/transparent_logo.png"
              alt="תקוותנו"
              width={200}
              height={80}
              style={{ width: "auto", height: "7rem" }}
              className="translate-y-[8px] transition-transform duration-300 group-hover:scale-[1.03]"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  className={`
                    relative px-5 py-2.5 rounded-lg text-[0.95rem] md:text-base font-medium
                    transition-all duration-200
                    ${isHebrew ? "font-[family-name:var(--font-heebo)]" : "font-[family-name:var(--font-source-sans)]"}
                    ${active
                      ? "text-navy"
                      : "text-navy/60 hover:text-navy hover:bg-navy/[0.04]"
                    }
                  `}
                >
                  {t(item.labelKey)}
                  {active && (
                    <span className="absolute bottom-0.5 inset-x-3 h-[2px] rounded-full bg-terracotta" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side: locale switcher + mobile menu */}
          <div className="flex items-center gap-2">
            <LocaleSwitcher />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-navy/60 hover:text-navy hover:bg-navy/[0.04] transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200"
              >
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="16" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
