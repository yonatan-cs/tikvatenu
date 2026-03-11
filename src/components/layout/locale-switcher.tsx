"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = locale === "he" ? "en" : "he";
  const label = locale === "he" ? "EN" : "עב";

  function handleSwitch() {
    router.replace(pathname, { locale: otherLocale });
  }

  return (
    <button
      onClick={handleSwitch}
      className="
        px-3 py-1.5 rounded-full text-xs font-bold tracking-wider
        border border-navy/15 text-navy/55
        hover:border-terracotta/40 hover:text-terracotta hover:bg-terracotta/[0.04]
        transition-all duration-200
        uppercase cursor-pointer
      "
      aria-label={`Switch to ${otherLocale === "he" ? "Hebrew" : "English"}`}
    >
      {label}
    </button>
  );
}
