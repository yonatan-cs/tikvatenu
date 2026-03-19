"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const navItems = [
  { href: "/", labelKey: "home" },
  { href: "/about", labelKey: "about" },
  { href: "/events", labelKey: "events" },
  { href: "/magazine", labelKey: "magazine" },
  { href: "/join", labelKey: "join" },
  { href: "/yehonatan", labelKey: "deutsch" },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: Props) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const isHebrew = locale === "he";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <div
      className={`
        md:hidden overflow-hidden transition-all duration-300 ease-out
        border-t border-branch/8
        ${open ? "max-h-80 opacity-100" : "max-h-0 opacity-0 border-transparent"}
      `}
    >
      <div className="glass px-4 py-3">
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.labelKey}
                href={item.href}
                onClick={onClose}
                className={`
                  relative px-4 py-3 rounded-xl text-base font-medium
                  transition-all duration-200
                  ${isHebrew ? "font-[family-name:var(--font-heebo)]" : "font-[family-name:var(--font-source-sans)]"}
                  ${active
                    ? "text-navy bg-navy/[0.05]"
                    : "text-navy/60 hover:text-navy hover:bg-navy/[0.04]"
                  }
                `}
              >
                {active && (
                  <span className="absolute top-1/2 -translate-y-1/2 start-0 w-[3px] h-5 rounded-full bg-terracotta" />
                )}
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
