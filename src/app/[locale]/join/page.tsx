import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { JoinForm } from "@/components/join/join-form";
import { ContactForm } from "@/components/join/contact-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "join" });

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function JoinPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("join");
  const isHebrew = locale === "he";

  // Get Instagram URL from settings
  const supabase = await createClient();
  const { data: instaSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "instagram_url")
    .single();

  const instagramUrl = (instaSetting?.value as string) || "";

  const displayFont = isHebrew
    ? "font-['Secular_One']"
    : "font-[family-name:var(--font-playfair)]";

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden grain-overlay pt-2 md:pt-4">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(200,149,108,0.1),transparent_60%)]" />

        {/* Botanical decoration */}
        <div className="absolute bottom-[10%] start-[5%] w-48 h-48 opacity-[0.04] pointer-events-none">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
            <path
              d="M100 20c-30 40-70 60-90 90s10 70 50 80 90-10 110-60 0-90-70-110"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-parchment"
            />
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center stagger-children">
            <h1 className={`text-4xl md:text-5xl font-bold text-parchment leading-[1.15] tracking-tight ${displayFont}`}>
              {t("title")}
            </h1>
            <p className="mt-5 text-lg text-parchment/60 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="wave-bottom">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="text-cream">
            <path d="M0 80L60 72C120 64 240 48 360 40C480 32 600 32 720 36C840 40 960 48 1080 52C1200 56 1320 56 1380 56L1440 56V80H0Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Forms */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <JoinForm isHebrew={isHebrew} />
          <ContactForm isHebrew={isHebrew} />
        </div>
      </section>

      {/* Social links */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy/[0.03] via-transparent to-terracotta/[0.03] border border-branch/[0.06] p-10 md:p-14 text-center">
          {/* Decorative corner elements */}
          <div className="absolute top-4 start-4 w-8 h-8 border-t border-s border-branch/10 rounded-tl-lg" />
          <div className="absolute bottom-4 end-4 w-8 h-8 border-b border-e border-branch/10 rounded-br-lg" />

          <h3 className={`text-xl font-bold text-navy mb-6 ${displayFont}`}>
            {t("social.title")}
          </h3>
          <div className="flex items-center justify-center gap-4">
            <a
              href={instagramUrl || "https://instagram.com/tikvatenu"}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-3 px-6 py-3 rounded-full
                bg-white shadow-sm border border-branch/[0.08]
                text-navy hover:bg-navy/[0.03] hover:border-branch/15 transition-all duration-200
              "
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" />
              </svg>
              <span className="font-medium">{t("social.instagram")}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
