import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { HeroEvent } from "@/components/home/hero-event";
import { UpdatesFeed } from "@/components/home/updates-feed";
import { FeaturedArticle } from "@/components/home/featured-article";
import { InstagramWidget } from "@/components/home/instagram-widget";
import type { Event, Article, Update } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const isHebrew = locale === "he";

  const supabase = await createClient();

  // Fetch next upcoming event
  const { data: nextEvent } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(1)
    .single();

  // Fetch latest updates
  const { data: latestUpdates } = await supabase
    .from("updates")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(6);

  // Fetch featured article from settings
  const { data: featuredSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "featured_article_id")
    .single();

  let featuredArticle: Article | null = null;
  if (featuredSetting?.value) {
    const { data: article } = await supabase
      .from("articles")
      .select("*")
      .eq("id", featuredSetting.value)
      .eq("is_published", true)
      .single();
    featuredArticle = article as Article | null;
  }

  // If no featured article selected, get the latest published one
  if (!featuredArticle) {
    const { data: latest } = await supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .single();
    featuredArticle = latest as Article | null;
  }

  // Get Instagram URL from settings
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
      {/* Hero Section */}
      {nextEvent ? (
        <HeroEvent event={nextEvent as Event} isHebrew={isHebrew} />
      ) : (
        <section className="relative overflow-hidden grain-overlay min-h-[85vh] flex items-start pt-2 md:pt-4">
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(74,127,181,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(200,149,108,0.1),transparent_50%)]" />

          {/* Large decorative botanical element */}
          <div className="absolute top-[5%] end-[5%] w-[500px] h-[500px] opacity-[0.04] animate-float pointer-events-none">
            <svg viewBox="0 0 500 500" fill="none" className="w-full h-full">
              <path
                d="M380 60c-25 50-75 100-150 130s-120 70-100 150c20 80 100 100 180 70s120-100 120-200c0-50-20-100-50-150z"
                stroke="currentColor"
                strokeWidth="1"
                className="text-parchment"
              />
              <path
                d="M300 120c-20 40-50 70-90 90s-60 50-40 90c20 40 60 40 100 20s60-60 50-110c-5-30-10-60-20-90z"
                stroke="currentColor"
                strokeWidth="0.8"
                className="text-parchment"
              />
              <path
                d="M250 180c15 30 10 60-10 85s-35 45-20 70"
                stroke="currentColor"
                strokeWidth="0.6"
                className="text-parchment"
              />
            </svg>
          </div>

          {/* Small decorative element bottom-left */}
          <div className="absolute bottom-[15%] start-[8%] w-32 h-32 opacity-[0.04] pointer-events-none">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" className="text-parchment" />
              <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="0.5" className="text-parchment" />
            </svg>
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="max-w-3xl stagger-children">
              {/* Logo */}
              <div className="mb-0">
                <Image
                  src="/images/transparent_logo.png"
                  alt="תקוותנו"
                  width={400}
                  height={160}
                  style={{ width: "auto", height: "18rem" }}
                  className="brightness-0 invert opacity-95"
                  priority
                />
              </div>

              {/* Title */}
              <h1
                className={`-mt-12 text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-parchment leading-[1.15] tracking-tight ${displayFont}`}
              >
                {isHebrew ? "תקוותנו - צעירים למען עתיד ישראל" : "Tikvatenu - Youth for the Future of Israel"}
              </h1>

              {/* Subtitle */}
              <p className="mt-7 text-lg md:text-xl text-parchment/60 max-w-2xl leading-relaxed">
                {t("home.hero.description")}
              </p>

              {/* CTAs */}
              <div className="mt-11 flex flex-wrap gap-4">
                <Link
                  href="/join"
                  className="btn-shine inline-flex items-center px-8 py-3.5 rounded-full bg-terracotta text-white font-semibold text-base hover:bg-terracotta-dark transition-all duration-300 shadow-lg shadow-terracotta/25 hover:shadow-terracotta/35 hover:-translate-y-0.5"
                >
                  {isHebrew ? "הצטרפו אלינו" : "Join Us"}
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center px-8 py-3.5 rounded-full border border-parchment/20 text-parchment/80 font-semibold text-base hover:bg-parchment/[0.06] hover:border-parchment/35 hover:text-parchment transition-all duration-300 hover:-translate-y-0.5"
                >
                  {t("home.hero.cta")}
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom wave */}
          <div className="wave-bottom">
            <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="text-cream">
              <path d="M0 80L60 72C120 64 240 48 360 40C480 32 600 32 720 36C840 40 960 48 1080 52C1200 56 1320 56 1380 56L1440 56V80H0Z" fill="currentColor" />
            </svg>
          </div>
        </section>
      )}

      {/* Updates Feed */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className={`text-2xl md:text-3xl font-bold text-navy ${displayFont}`}>
              {t("home.feed.title")}
            </h2>
            <div className="mt-2 h-[2px] w-12 rounded-full bg-terracotta/50" />
          </div>
        </div>

        {(latestUpdates || []).length > 0 ? (
          <UpdatesFeed updates={(latestUpdates || []) as Update[]} isHebrew={isHebrew} />
        ) : (
          <p className="text-center text-ink-muted py-12">{t("home.feed.empty")}</p>
        )}
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="section-cool py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className={`text-2xl md:text-3xl font-bold text-navy ${displayFont}`}>
                {t("home.featured.title")}
              </h2>
              <div className="mt-2 h-[2px] w-12 rounded-full bg-terracotta/50" />
            </div>
            <FeaturedArticle article={featuredArticle} isHebrew={isHebrew} />
          </div>
        </section>
      )}

      {/* Instagram */}
      {instagramUrl && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <InstagramWidget url={instagramUrl} isHebrew={isHebrew} />
        </section>
      )}
    </div>
  );
}
