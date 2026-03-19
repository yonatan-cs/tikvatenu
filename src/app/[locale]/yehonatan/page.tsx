import { setRequestLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "deutsch" });

  return {
    title: t("title"),
    description: t("intro"),
  };
}

export default async function DeutschPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("deutsch");
  const isHebrew = locale === "he";

  const displayFont = isHebrew
    ? "font-['Secular_One']"
    : "font-[family-name:var(--font-playfair)]";

  const letterParagraphs = t("letter").split("\n\n");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden grain-overlay pt-2 md:pt-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-navy to-navy-light" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(74,127,181,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_30%,rgba(200,149,108,0.07),transparent_50%)]" />

        {/* Cover sticker — large, embedded in background */}
        <div
          className="absolute inset-y-0 pointer-events-none"
          style={{ right: "55%", width: "40%" }}
          aria-hidden
        >
          <Image
            src="/images/yehonatan/cover.png"
            alt=""
            fill
            className="object-contain object-center opacity-85"
            sizes="52vw"
            priority
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl stagger-children">
            {/* Memorial label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/20 border border-terracotta/30 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
              <span className="text-terracotta/90 text-sm font-medium tracking-wide">
                {isHebrew ? "לזכרו" : "In Memoriam"}
              </span>
            </div>

            <h1
              className={`text-4xl md:text-5xl lg:text-[3.3rem] font-bold text-parchment leading-[1.2] tracking-tight ${displayFont}`}
            >
              {t("title")}
            </h1>

            <p className="mt-6 text-xl md:text-2xl text-terracotta/80 font-medium leading-relaxed">
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

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-lg md:text-xl text-ink-light leading-relaxed text-center">
            {t("intro")}
          </p>
        </div>
      </section>

      {/* Botanical divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="botanical-divider" />
      </div>

      {/* Quotes Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="text-center mb-12">
          <h2 className={`text-2xl md:text-3xl font-bold text-navy ${displayFont}`}>
            {t("quotesTitle")}
          </h2>
          <div className="mt-3 mx-auto h-[2px] w-12 rounded-full bg-terracotta/50" />
        </div>

        <div className="space-y-8">
          {/* Quote 1 */}
          <QuoteCard
            text={t("quote1.text")}
            source={t("quote1.source")}
            accentColor="terracotta"
          />

          {/* Quote 2 */}
          <QuoteCard
            text={t("quote2.text")}
            source={t("quote2.source")}
            accentColor="sky"
          />

          {/* Quote 3 */}
          <QuoteCard
            text={t("quote3.text")}
            source={t("quote3.source")}
            accentColor="branch"
          />

          {/* Quote 4 */}
          <QuoteCard
            text={t("quote4.text")}
            source={t("quote4.source")}
            accentColor="terracotta"
          />
        </div>
      </section>

      {/* Botanical divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="botanical-divider" />
      </div>

      {/* Letter to Brother */}
      <section className="section-cool py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className={`text-2xl md:text-3xl font-bold text-navy ${displayFont}`}>
                {t("letterTitle")}
              </h2>
              <div className="mt-3 mx-auto h-[2px] w-12 rounded-full bg-terracotta/50" />
            </div>

            <div className="relative overflow-hidden rounded-3xl grain-overlay">
              <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(74,127,181,0.10),transparent_60%)]" />
              <div className="absolute top-6 start-6 opacity-20">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-terracotta">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor" />
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="currentColor" />
                </svg>
              </div>

              <div className="relative z-10 p-8 md:p-12 space-y-6">
                {letterParagraphs.map((paragraph, i) => (
                  <p key={i} className="text-parchment/85 leading-relaxed text-base md:text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="text-center mb-10">
          <h2 className={`text-2xl md:text-3xl font-bold text-navy ${displayFont}`}>
            {t("screenshotsTitle")}
          </h2>
          <div className="mt-3 mx-auto h-[2px] w-12 rounded-full bg-terracotta/50" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { src: "/images/yehonatan/shabbat-group.jpg", alt: isHebrew ? "החבר׳ה" : "The group" },
            { src: "/images/yehonatan/map1.jpg", alt: isHebrew ? "תכנון עם מפה" : "Planning with a map" },
            { src: "/images/yehonatan/map2.jpg", alt: isHebrew ? "תכנון עם מפה" : "Planning with a map" },
            { src: "/images/yehonatan/video-call.jpg", alt: isHebrew ? "שיחת וידאו" : "Video call" },
            { src: "/images/yehonatan/meeting.jpg", alt: isHebrew ? "ישיבת תכנון" : "Planning meeting" },
            { src: "/images/yehonatan/two-friends.jpg", alt: isHebrew ? "חברים" : "Friends" },
          ].map((photo) => (
            <div key={photo.src} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-navy/[0.04]">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Memorial closing */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-3xl grain-overlay">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-navy to-navy-light" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(200,149,108,0.08),transparent_60%)]" />
          <div className="relative z-10 p-10 md:p-16 text-center">
            <p className={`text-2xl md:text-3xl font-bold text-parchment ${displayFont}`}>
              {isHebrew ? "יהי זכרו ברוך" : "May his memory be a blessing"}
            </p>
            <div className="mt-4 mx-auto h-[1px] w-16 bg-terracotta/40" />
            <p className="mt-4 text-parchment/50 text-base">
              {isHebrew
                ? "יהונתן דויטש הי״ד"
                : "Yonatan Deutsch HY\"D"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

type QuoteCardProps = {
  text: string;
  source: string;
  accentColor: "terracotta" | "sky" | "branch";
};

function QuoteCard({ text, source, accentColor }: QuoteCardProps) {
  const borderMap = {
    terracotta: "border-s-terracotta/60",
    sky: "border-s-sky/60",
    branch: "border-s-branch/60",
  };
  const sourceMap = {
    terracotta: "text-terracotta",
    sky: "text-sky",
    branch: "text-branch",
  };

  return (
    <div
      className={`card-organic p-7 md:p-9 border-s-4 ${borderMap[accentColor]}`}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        className={`mb-4 opacity-40 ${sourceMap[accentColor]}`}
      >
        <path
          d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"
          fill="currentColor"
        />
        <path
          d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"
          fill="currentColor"
        />
      </svg>
      <p className="text-ink leading-relaxed text-base md:text-lg mb-6 whitespace-pre-line">
        {text}
      </p>
      <div className="flex items-center gap-3">
        <div className={`h-[1px] w-8 opacity-50 ${accentColor === "terracotta" ? "bg-terracotta" : accentColor === "sky" ? "bg-sky" : "bg-branch"}`} />
        <span className={`text-sm font-medium ${sourceMap[accentColor]}`}>
          {source}
        </span>
      </div>
    </div>
  );
}
