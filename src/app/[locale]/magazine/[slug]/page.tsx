import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, BookOpen } from "lucide-react";
import { SafeHtml } from "@/components/shared/safe-html";
import type { Article } from "@/lib/types/database";
import Image from "next/image";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const categoryConfig: Record<string, { he: string; en: string; variant: "default" | "secondary" | "success" | "warning" }> = {
  thought: { he: "הגות", en: "Thought", variant: "default" },
  press: { he: "כתבות", en: "Press", variant: "secondary" },
  opinion: { he: "דעה", en: "Opinion", variant: "warning" },
  spirit: { he: "רוח", en: "Spirit", variant: "success" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("articles")
    .select("title_he, title_en, excerpt_he, excerpt_en, cover_image")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!article) return {};

  const title = locale === "he" ? article.title_he : article.title_en;
  const description = locale === "he" ? article.excerpt_he : article.excerpt_en;

  return {
    title,
    description,
    openGraph: {
      title,
      description: description || undefined,
      images: article.cover_image ? [article.cover_image] : [],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  const supabase = await createClient();
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!article) notFound();

  const typedArticle = article as Article;
  const title = isHebrew ? typedArticle.title_he : typedArticle.title_en;
  const excerpt = isHebrew ? typedArticle.excerpt_he : typedArticle.excerpt_en;
  const body = isHebrew ? typedArticle.body_he : typedArticle.body_en;
  const cat = categoryConfig[typedArticle.category] || categoryConfig.thought;

  return (
    <div>
      {/* Hero with cover image */}
      <div className="relative">
        {typedArticle.cover_image ? (
          <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
            <Image
              src={typedArticle.cover_image}
              alt={title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent" />
          </div>
        ) : (
          <div className="h-48 md:h-64 bg-gradient-to-br from-navy via-navy-light to-branch flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-white/20" />
          </div>
        )}

        {/* Back link */}
        <div className="absolute top-4 start-4">
          <Button asChild variant="ghost" size="sm" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 hover:text-white">
            <Link href="/magazine">
              <ArrowRight className={`w-4 h-4 ${isHebrew ? "" : "rotate-180"}`} />
              {isHebrew ? "כל המאמרים" : "All Articles"}
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-16">
        <article className="bg-white rounded-2xl border border-branch/5 p-6 md:p-10 shadow-sm">
          {/* Category & tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant={cat.variant}>
              {isHebrew ? cat.he : cat.en}
            </Badge>
            {typedArticle.tags.map((tag) => (
              <Link
                key={tag}
                href={`/magazine?tag=${encodeURIComponent(tag)}`}
                className="text-xs px-2.5 py-0.5 rounded-full bg-navy/3 text-ink-muted hover:bg-navy/5 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-4 ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
            {title}
          </h1>

          {/* Meta info */}
          {typedArticle.published_at && (
            <div className="flex items-center gap-2 text-sm text-ink-muted mb-6 pb-6 border-b border-branch/10">
              <Calendar className="w-4 h-4" />
              {new Date(typedArticle.published_at).toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          )}

          {/* Excerpt */}
          {excerpt && (
            <p className="text-lg text-ink-light mb-8 leading-relaxed font-medium">
              {excerpt}
            </p>
          )}

          {/* Body content */}
          {body && (
            <SafeHtml
              html={body}
              className="prose prose-lg max-w-none prose-headings:text-navy prose-p:text-ink prose-strong:text-navy prose-a:text-branch prose-a:no-underline hover:prose-a:underline"
              dir={isHebrew ? "rtl" : "ltr"}
            />
          )}

          {/* Embedded PDF viewer */}
          {typedArticle.pdf_url && (
            <div className={body ? "mt-10 pt-10 border-t border-branch/10" : ""}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold text-navy ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
                  {isHebrew ? "החוברת" : "The Booklet"}
                </h2>
                <a
                  href={typedArticle.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-branch hover:text-navy transition-colors font-medium"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {isHebrew ? "הורד PDF" : "Download PDF"}
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-branch/10 bg-cream-dark/20">
                <iframe
                  src={typedArticle.pdf_url}
                  className="w-full"
                  style={{ height: "80vh", minHeight: "600px" }}
                  title={isHebrew ? typedArticle.title_he : typedArticle.title_en}
                />
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
