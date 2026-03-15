import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Heebo, Playfair_Display, Source_Sans_3 } from "next/font/google";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "../globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tikvatenu.com";

  return {
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("description"),
    keywords: t.raw("keywords") as string[],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: locale === "he" ? baseUrl : `${baseUrl}/en`,
      languages: {
        "he": baseUrl,
        "en": `${baseUrl}/en`,
      },
    },
    icons: {
      icon: "/icon.png",
      apple: "/apple-icon.png",
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "he" ? "he_IL" : "en_US",
      alternateLocale: locale === "he" ? "en_US" : "he_IL",
      type: "website",
      siteName: "תקוותנו - Tikvatenu",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "he" | "en")) {
    notFound();
  }

  setRequestLocale(locale);

  const [messages, supabase] = await Promise.all([getMessages(), createClient()]);
  const { data: instaSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "instagram_url")
    .single();
  const instagramUrl = (instaSetting?.value as string) || "";
  const dir = locale === "he" ? "rtl" : "ltr";
  const isHebrew = locale === "he";

  return (
    <html lang={locale} dir={dir} data-scroll-behavior="smooth">
      <head>
        {/* Secular One for Hebrew display headings */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Secular+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`
          ${heebo.variable} ${playfairDisplay.variable} ${sourceSans.variable}
          ${isHebrew ? "font-[family-name:var(--font-heebo)]" : "font-[family-name:var(--font-source-sans)]"}
          bg-cream text-ink antialiased
          min-h-screen flex flex-col
        `}
      >
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer instagramUrl={instagramUrl} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
