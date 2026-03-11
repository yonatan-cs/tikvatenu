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
    description: t("mission.description"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const isHebrew = locale === "he";

  const supabase = await createClient();

  // Fetch some gallery images for the activities section
  const { data: galleryImages } = await supabase
    .from("gallery_images")
    .select("*, gallery_albums!inner(is_published)")
    .eq("gallery_albums.is_published", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const photos = (galleryImages || []) as (GalleryImage & { gallery_albums: { is_published: boolean } })[];

  const displayFont = isHebrew
    ? "font-['Secular_One']"
    : "font-[family-name:var(--font-playfair)]";

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden grain-overlay pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(74,127,181,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_30%,rgba(200,149,108,0.08),transparent_50%)]" />

        {/* Botanical decoration */}
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

        {/* Wave divider */}
        <div className="wave-bottom">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="text-cream">
            <path d="M0 80L60 72C120 64 240 48 360 40C480 32 600 32 720 36C840 40 960 48 1080 52C1200 56 1320 56 1380 56L1440 56V80H0Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          {/* The Challenge */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-error/[0.06] text-error text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {t("problem.title")}
            </div>
            <h2 className={`text-2xl md:text-3xl font-bold text-navy ${displayFont}`}>
              {t("problem.title")}
            </h2>
            <p className="text-lg text-ink-light leading-relaxed">
              {t("problem.description")}
            </p>
          </div>

          {/* Our Way */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green/[0.06] text-green text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {t("solution.title")}
            </div>
            <h2 className={`text-2xl md:text-3xl font-bold text-navy ${displayFont}`}>
              {t("solution.title")}
            </h2>
            <p className="text-lg text-ink-light leading-relaxed">
              {t("solution.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Botanical divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="botanical-divider" />
      </div>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center mb-14">
          <h2 className={`text-3xl md:text-4xl font-bold text-navy ${displayFont}`}>
            {t("values.title")}
          </h2>
          <div className="mt-3 mx-auto h-[2px] w-12 rounded-full bg-terracotta/50" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
          {/* Dialogue */}
          <div className="group card-organic p-8">
            <div className="w-12 h-12 rounded-2xl bg-branch/[0.07] flex items-center justify-center mb-6 group-hover:bg-branch/[0.12] transition-colors duration-300">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-branch">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold text-navy mb-3 ${displayFont}`}>
              {t("values.dialogue.title")}
            </h3>
            <p className="text-ink-light leading-relaxed">
              {t("values.dialogue.description")}
            </p>
          </div>

          {/* Bridge */}
          <div className="group card-organic p-8">
            <div className="w-12 h-12 rounded-2xl bg-terracotta/[0.07] flex items-center justify-center mb-6 group-hover:bg-terracotta/[0.12] transition-colors duration-300">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-terracotta">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold text-navy mb-3 ${displayFont}`}>
              {t("values.bridge.title")}
            </h3>
            <p className="text-ink-light leading-relaxed">
              {t("values.bridge.description")}
            </p>
          </div>

          {/* Hope */}
          <div className="group card-organic p-8">
            <div className="w-12 h-12 rounded-2xl bg-green/[0.07] flex items-center justify-center mb-6 group-hover:bg-green/[0.12] transition-colors duration-300">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold text-navy mb-3 ${displayFont}`}>
              {t("values.hope.title")}
            </h3>
            <p className="text-ink-light leading-relaxed">
              {t("values.hope.description")}
            </p>
          </div>

          {/* Youth */}
          <div className="group card-organic p-8">
            <div className="w-12 h-12 rounded-2xl bg-sky/[0.07] flex items-center justify-center mb-6 group-hover:bg-sky/[0.12] transition-colors duration-300">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sky">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold text-navy mb-3 ${displayFont}`}>
              {t("values.youth.title")}
            </h3>
            <p className="text-ink-light leading-relaxed">
              {t("values.youth.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Activity Photos */}
      {photos.length > 0 && (
        <section className="section-cool py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className={`text-3xl md:text-4xl font-bold text-navy ${displayFont}`}>
                {t("activities.title")}
              </h2>
              <p className="mt-3 text-lg text-ink-muted">
                {t("activities.description")}
              </p>
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
                {t("activities.title")}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isHebrew ? "rotate-180" : ""}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl grain-overlay">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(200,149,108,0.1),transparent_60%)]" />

          {/* Botanical decoration */}
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
