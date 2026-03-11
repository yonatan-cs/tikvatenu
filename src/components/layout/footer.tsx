"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const isHebrew = locale === "he";
  const year = new Date().getFullYear();
  const [instagramUrl, setInstagramUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadInstagramUrl() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "instagram_url")
          .single();

        if (data?.value && typeof data.value === "string") {
          setInstagramUrl(data.value);
        }
      } catch (error) {
        // If fetching fails, we silently fall back to the default URL.
        console.error("Failed to load Instagram URL from settings", error);
      }
    }

    void loadInstagramUrl();
  }, []);

  const fallbackInstagramUrl = "https://instagram.com/tikvatenu";
  const instagramHref = instagramUrl || fallbackInstagramUrl;

  return (
    <footer className="relative bg-navy text-parchment/90">
      {/* Top edge line */}
      <div className="h-px bg-gradient-to-r from-transparent via-branch/30 to-transparent" />

      {/* Decorative botanical SVG */}
      <div className="absolute top-0 end-0 w-72 h-72 opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 300 300" fill="none" className="w-full h-full">
          <path
            d="M250 40c-30 50-80 90-140 110s-60 80-20 130c40 50 100 60 160 40s100-70 110-150"
            stroke="currentColor"
            strokeWidth="1"
            className="text-parchment"
          />
          <path
            d="M200 80c15 25 5 60-25 85s-45 50-25 80"
            stroke="currentColor"
            strokeWidth="0.8"
            className="text-parchment"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Logo & tagline */}
          <div className="md:col-span-5 space-y-0">
            <Image
              src="/images/transparent_logo.png"
              alt="תקוותנו"
              width={240}
              height={96}
              style={{ width: "auto", height: "10rem" }}
              className="-mt-8 md:-mt-10 brightness-0 invert opacity-80"
            />
            <p className="-mt-4 md:-mt-5 text-sm text-parchment/45 max-w-xs leading-relaxed">
              {t("footer.tagline")}
            </p>
            <p className="text-sm text-parchment/55 max-w-md leading-relaxed whitespace-pre-line">
              {t("footer.about")}
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h3
              className={`
                text-xs font-semibold uppercase tracking-[0.15em] text-parchment/35 mb-5
                ${isHebrew ? "font-[family-name:var(--font-heebo)]" : "font-[family-name:var(--font-source-sans)]"}
              `}
            >
              {isHebrew ? "ניווט" : "Navigation"}
            </h3>
            <nav className="flex flex-col gap-2.5">
              {[
                { href: "/about", key: "nav.about" },
                { href: "/events", key: "nav.events" },
                { href: "/magazine", key: "nav.magazine" },
                { href: "/join", key: "nav.join" },
              ].map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="text-sm text-parchment/55 hover:text-parchment transition-colors duration-200"
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social links */}
          <div className="md:col-span-4">
            <h3
              className={`
                text-xs font-semibold uppercase tracking-[0.15em] text-parchment/35 mb-5
                ${isHebrew ? "font-[family-name:var(--font-heebo)]" : "font-[family-name:var(--font-source-sans)]"}
              `}
            >
              {t("join.social.title")}
            </h3>
            <div className="flex gap-3">
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  w-10 h-10 rounded-xl bg-parchment/[0.06] flex items-center justify-center
                  hover:bg-parchment/[0.12] transition-all duration-200
                  group
                "
                aria-label="Instagram"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-parchment/50 group-hover:text-parchment/80 transition-colors"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" />
                </svg>
              </a>
            </div>
            <p className="mt-5 text-xs text-parchment/30 leading-relaxed max-w-xs">
              {isHebrew
                ? "נבנה מתוך תקווה לעתיד משותף."
                : "Built with hope for a shared future."
              }
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-parchment/[0.07]">
          <p className="text-xs text-parchment/30 text-center">
            &copy; {year} {isHebrew ? "תקוותנו" : "Tikvatenu"}. {t("footer.rights")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
