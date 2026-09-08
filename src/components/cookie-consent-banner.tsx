"use client";

import { useTranslations, useLocale } from "next-intl";
import { useCookieConsent } from "@/contexts/cookie-consent-context";
import { Link } from "@/i18n/navigation";
import { X, Cookie } from "lucide-react";

export function CookieConsentBanner() {
  const t = useTranslations();
  const locale = useLocale();
  const isHebrew = locale === "he";
  const { showBanner, acceptCookies, rejectCookies } = useCookieConsent();

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 bg-white border-t-2 border-branch shadow-2xl"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-6 h-6 text-terracotta flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2
                id="cookie-banner-title"
                className={`text-base font-bold text-navy mb-1.5 ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}
              >
                {isHebrew ? "הסכמה לשימוש בעוגיות" : "Cookie Consent"}
              </h2>
              <p id="cookie-banner-description" className="text-sm text-ink leading-relaxed">
                {isHebrew ? (
                  <>
                    אנו משתמשים בעוגיות הכרחיות לתפקוד האתר, ובעוגיות לא הכרחיות (אנליטיקה וניטור שגיאות) לשיפור חוויית השימוש. באפשרותכם לבחור לקבל או לדחות עוגיות לא הכרחיות.{" "}
                    <Link href="/cookies" className="underline text-terracotta hover:text-terracotta-dark transition-colors">
                      מדיניות עוגיות
                    </Link>
                  </>
                ) : (
                  <>
                    We use essential cookies for site functionality, and non-essential cookies (analytics and error monitoring) to improve user experience. You can choose to accept or decline non-essential cookies.{" "}
                    <Link href="/cookies" className="underline text-terracotta hover:text-terracotta-dark transition-colors">
                      Cookie Policy
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={rejectCookies}
              className="
                px-5 py-2.5 rounded-lg border border-branch/30 bg-white text-navy font-medium text-sm
                hover:bg-cream transition-colors focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2
              "
              aria-label={isHebrew ? "דחו עוגיות לא הכרחיות" : "Decline non-essential cookies"}
            >
              {isHebrew ? "דחו" : "Decline"}
            </button>
            <button
              onClick={acceptCookies}
              className="
                px-5 py-2.5 rounded-lg bg-terracotta text-white font-semibold text-sm
                hover:bg-terracotta-dark transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2
              "
              aria-label={isHebrew ? "קבלו עוגיות לא הכרחיות" : "Accept non-essential cookies"}
            >
              {isHebrew ? "קבלו" : "Accept"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
