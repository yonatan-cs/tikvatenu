import type { JSX } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import type { GalleryImage } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("title"),
    description: t("vision.description"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const isHebrew = locale === "he";

  const supabase = await createClient();

  const { data: galleryImages } = await supabase
    .from("gallery_images")
    .select("*, gallery_albums!inner(is_published)")
    .eq("gallery_albums.is_published", true)
    .limit(30);

  const allPhotos = (galleryImages || []) as (GalleryImage & { gallery_albums: { is_published: boolean } })[];
  // Shuffle and pick 6 random photos
  const shuffled = [...allPhotos].sort(() => Math.random() - 0.5);
  const photos = shuffled.slice(0, 6);

  const displayFont = isHebrew
    ? "font-['Secular_One']"
    : "font-[family-name:var(--font-playfair)]";

  const principles = [
    { key: "hineni", bgClass: "bg-terracotta/[0.07]", hoverClass: "group-hover:bg-terracotta/[0.12]", iconColor: "text-terracotta" },
    { key: "continuity", bgClass: "bg-branch/[0.07]", hoverClass: "group-hover:bg-branch/[0.12]", iconColor: "text-branch" },
    { key: "tikun", bgClass: "bg-green/[0.07]", hoverClass: "group-hover:bg-green/[0.12]", iconColor: "text-green" },
    { key: "learning", bgClass: "bg-sky/[0.07]", hoverClass: "group-hover:bg-sky/[0.12]", iconColor: "text-sky" },
    { key: "community", bgClass: "bg-terracotta/[0.07]", hoverClass: "group-hover:bg-terracotta/[0.12]", iconColor: "text-terracotta" },
    { key: "unity", bgClass: "bg-branch/[0.07]", hoverClass: "group-hover:bg-branch/[0.12]", iconColor: "text-branch" },
    { key: "state", bgClass: "bg-green/[0.07]", hoverClass: "group-hover:bg-green/[0.12]", iconColor: "text-green" },
  ] as const;

  const activities = ["study", "seminars", "social", "gatherings"] as const;
  const activityIcons = {
    study: "book",
    seminars: "presentation",
    social: "heart",
    gatherings: "people",
  };

  const structures = ["steering", "planning", "communityGroup"] as const;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden grain-overlay pt-2 md:pt-4">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(74,127,181,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_30%,rgba(200,149,108,0.08),transparent_50%)]" />

        <div className="absolute top-[8%] end-[8%] w-72 h-72 opacity-[0.04] animate-float pointer-events-none">
          <svg viewBox="0 0 300 300" fill="none" className="w-full h-full">
            <path
              d="M200 30c-30 50-80 90-140 110s-60 80-20 130c40 50 100 60 160 40s100-70 110-150c10-50-10-100-50-140"
              stroke="currentColor"
              strokeWidth="1"
              className="text-parchment"
            />
            <path
              d="M180 80c20 30 10 70-20 100s-50 60-30 90c20 30 60 30 90 10s50-60 40-100c-10-30-40-60-80-100"
              stroke="currentColor"
              strokeWidth="0.7"
              className="text-parchment"
            />
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl stagger-children">
            <h1 className={`text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-parchment leading-[1.15] tracking-tight ${displayFont}`}>
              {t("title")}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-parchment/60 max-w-2xl leading-relaxed">
              {t("heroSubtitle")}
            </p>
          </div>
        </div>

        <div className="wave-bottom">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="text-cream">
            <path d="M0 80L60 72C120 64 240 48 360 40C480 32 600 32 720 36C840 40 960 48 1080 52C1200 56 1320 56 1380 56L1440 56V80H0Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Vision & Belief */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          {/* Vision */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-terracotta/[0.06] text-terracotta text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              {t("vision.title")}
            </div>
            <h2 className={`text-2xl md:text-3xl font-bold text-navy ${displayFont}`}>
              {t("vision.title")}
            </h2>
            <p className="text-lg text-ink-light leading-relaxed">
              {t("vision.description")}
            </p>
            <p className="text-lg text-ink-light leading-relaxed">
              {t("vision.description2")}
            </p>
          </div>

          {/* Belief */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green/[0.06] text-green text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {t("belief.title")}
            </div>
            <h2 className={`text-2xl md:text-3xl font-bold text-navy ${displayFont}`}>
              {t("belief.title")}
            </h2>
            <p className="text-lg text-ink-light leading-relaxed">
              {t("belief.description")}
            </p>
            <p className="text-lg text-ink-light leading-relaxed">
              {t("belief.description2")}
            </p>
          </div>
        </div>
      </section>

      {/* Botanical divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="botanical-divider" />
      </div>

      {/* The Way */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="text-center mb-8">
          <h2 className={`text-3xl md:text-4xl font-bold text-navy ${displayFont}`}>
            {t("way.title")}
          </h2>
          <div className="mt-3 mx-auto h-[2px] w-12 rounded-full bg-terracotta/50" />
        </div>
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-lg text-ink-light leading-relaxed text-center">
            {t("way.description")}
          </p>
          <p className="text-lg text-ink-light leading-relaxed text-center">
            {t("way.description2")}
          </p>
          <p className="text-lg text-ink-light leading-relaxed text-center">
            {t("way.description3")}
          </p>
        </div>
      </section>

      {/* Botanical divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="botanical-divider" />
      </div>

      {/* Principles */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="text-center mb-8">
          <h2 className={`text-3xl md:text-4xl font-bold text-navy ${displayFont}`}>
            {t("principles.title")}
          </h2>
          <div className="mt-3 mx-auto h-[2px] w-12 rounded-full bg-terracotta/50" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {principles.map(({ key, bgClass, hoverClass, iconColor }) => (
            <div key={key} className="group card-organic p-8">
              <div className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center mb-6 ${hoverClass} transition-colors duration-300`}>
                <PrincipleIcon name={key} className={iconColor} />
              </div>
              <h3 className={`text-xl font-bold text-navy mb-3 ${displayFont}`}>
                {t(`principles.${key}.title`)}
              </h3>
              <p className="text-ink-light leading-relaxed">
                {t(`principles.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Activities */}
      <section className="section-cool py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className={`text-3xl md:text-4xl font-bold text-navy ${displayFont}`}>
              {t("activities.title")}
            </h2>
            <div className="mt-3 mx-auto h-[2px] w-12 rounded-full bg-terracotta/50" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
            {activities.map((key) => (
              <div key={key} className="group card-organic p-8">
                <div className="w-12 h-12 rounded-2xl bg-branch/[0.07] flex items-center justify-center mb-6 group-hover:bg-branch/[0.12] transition-colors duration-300">
                  <ActivityIcon name={activityIcons[key]} className="text-branch" />
                </div>
                <h3 className={`text-xl font-bold text-navy mb-3 ${displayFont}`}>
                  {t(`activities.${key}.title`)}
                </h3>
                <p className="text-ink-light leading-relaxed">
                  {t(`activities.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Structure */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="text-center mb-8">
          <h2 className={`text-3xl md:text-4xl font-bold text-navy ${displayFont}`}>
            {t("structure.title")}
          </h2>
          <div className="mt-3 mx-auto h-[2px] w-12 rounded-full bg-terracotta/50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {structures.map((key) => (
            <div key={key} className="group card-organic p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-sky/[0.07] flex items-center justify-center mb-6 mx-auto group-hover:bg-sky/[0.12] transition-colors duration-300">
                <StructureIcon name={key} className="text-sky" />
              </div>
              <h3 className={`text-xl font-bold text-navy mb-3 ${displayFont}`}>
                {t(`structure.${key}.title`)}
              </h3>
              <p className="text-ink-light leading-relaxed">
                {t(`structure.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quotes */}
      <section className="section-cool py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Herzl Quote */}
            <div className="relative overflow-hidden rounded-3xl grain-overlay">
              <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(200,149,108,0.1),transparent_60%)]" />
              <div className="relative z-10 p-8 md:p-10">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-terracotta/40 mb-4">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor" />
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="currentColor" />
                </svg>
                <p className="text-parchment/80 leading-relaxed text-base mb-6">
                  {t("quotes.herzl.text")}
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-8 bg-terracotta/40" />
                  <span className={`text-terracotta font-semibold ${displayFont}`}>
                    {t("quotes.herzl.author")}
                  </span>
                </div>
              </div>
            </div>

            {/* Sadeh Quote */}
            <div className="relative overflow-hidden rounded-3xl grain-overlay">
              <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(74,127,181,0.1),transparent_60%)]" />
              <div className="relative z-10 p-8 md:p-10">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-terracotta/40 mb-4">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor" />
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="currentColor" />
                </svg>
                <p className="text-parchment/80 leading-relaxed text-base mb-6">
                  {t("quotes.sadeh.text")}
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-8 bg-terracotta/40" />
                  <span className={`text-terracotta font-semibold ${displayFont}`}>
                    {t("quotes.sadeh.author")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro / About Us */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-lg text-ink-light leading-relaxed text-center">
            {t("intro.description")}
          </p>
          <p className="text-lg text-ink-light leading-relaxed text-center">
            {t("intro.description2")}
          </p>
          <p className="text-lg text-ink-light leading-relaxed text-center">
            {t("intro.description3")}
          </p>
        </div>
      </section>

      {/* Activity Photos */}
      {photos.length > 0 && (
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className={`text-3xl md:text-4xl font-bold text-navy ${displayFont}`}>
                {t("gallery.title")}
              </h2>
              <div className="mt-3 mx-auto h-[2px] w-12 rounded-full bg-terracotta/50" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-sm"
                >
                  <Image
                    src={photo.image_url}
                    alt={isHebrew ? (photo.caption_he || "") : (photo.caption_en || "")}
                    fill
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-branch hover:text-navy font-medium transition-colors duration-200"
              >
                {t("gallery.title")}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isHebrew ? "rotate-180" : ""}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative overflow-hidden rounded-3xl grain-overlay">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(200,149,108,0.1),transparent_60%)]" />

          <div className="absolute top-0 start-0 w-52 h-52 opacity-[0.04] pointer-events-none">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
              <path d="M100 15c-30 30-75 50-90 80s5 70 40 85 85-5 105-50 5-95-55-115" stroke="currentColor" strokeWidth="1" className="text-parchment" />
            </svg>
          </div>

          <div className="relative z-10 p-10 md:p-16 text-center">
            <h2 className={`text-3xl md:text-4xl font-bold text-parchment mb-5 ${displayFont}`}>
              {t("cta.title")}
            </h2>
            <p className="text-lg text-parchment/60 max-w-2xl mx-auto mb-9 leading-relaxed">
              {t("cta.description")}
            </p>
            <Link
              href="/join"
              className="btn-shine inline-flex items-center px-8 py-3.5 rounded-full bg-terracotta text-white font-semibold text-base hover:bg-terracotta-dark transition-all duration-300 shadow-lg shadow-terracotta/25 hover:shadow-terracotta/35 hover:-translate-y-0.5"
            >
              {t("cta.button")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Icon Components */

function PrincipleIcon({ name, className }: { name: string; className: string }) {
  const icons: Record<string, JSX.Element> = {
    hineni: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    ),
    continuity: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    tikun: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    learning: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    community: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    unity: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
    state: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  };
  return icons[name] || null;
}

function ActivityIcon({ name, className }: { name: string; className: string }) {
  const icons: Record<string, JSX.Element> = {
    book: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    presentation: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 3h20" />
        <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
        <path d="M12 16v4" />
        <path d="M8 20h8" />
      </svg>
    ),
    heart: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    people: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  };
  return icons[name] || null;
}

function StructureIcon({ name, className }: { name: string; className: string }) {
  const icons: Record<string, JSX.Element> = {
    steering: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    planning: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    communityGroup: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  };
  return icons[name] || null;
}
