import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ArticleCard } from "@/components/magazine/article-card";
import { BookOpen } from "lucide-react";
import type { Article } from "@/lib/types/database";
import type { Metadata } from "next";
import { MagazineFilters } from "@/components/magazine/magazine-filters";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; tag?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "magazine" });
  return {
    title: t("title"),
  };
}

export default async function MagazinePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { category, tag } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("magazine");
  const isHebrew = locale === "he";

  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data: articles } = await query;
  const typedArticles = (articles || []) as Article[];

  // Get all unique tags from published articles for the filter
  const { data: allArticles } = await supabase
    .from("articles")
    .select("tags")
    .eq("is_published", true);

  const allTags = Array.from(
    new Set((allArticles || []).flatMap((a: { tags: string[] }) => a.tags || []))
  ).sort();

  const displayFont = isHebrew
    ? "font-['Secular_One']"
    : "font-[family-name:var(--font-playfair)]";

  return (
    <div>
      {/* Page header */}
      <div className="relative overflow-hidden hero-pattern pt-2 md:pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-2xl">
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-navy mb-4 ${displayFont}`}>
              {t("title")}
            </h1>
            <p className="text-lg text-ink-muted leading-relaxed">
              {isHebrew
                ? "מאמרי הגות, רוח, דעה וכתבות - מרחב לשיח ולמחשבה על עתיד החברה הישראלית."
                : "Thought pieces, spirit, opinion and press - a space for discourse and reflection on the future of Israeli society."
              }
            </p>
            <div className="mt-4 h-[2px] w-12 rounded-full bg-terracotta/50" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        {/* Filters */}
        <MagazineFilters
          activeCategory={category || "all"}
          activeTag={tag || ""}
          allTags={allTags}
          isHebrew={isHebrew}
        />

        {/* Articles grid */}
        {typedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {typedArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                isHebrew={isHebrew}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 card-organic">
            <BookOpen className="w-12 h-12 text-branch/15 mx-auto mb-4" />
            <p className="text-ink-muted">
              {isHebrew ? "אין מאמרים עדיין בקטגוריה זו." : "No articles in this category yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
