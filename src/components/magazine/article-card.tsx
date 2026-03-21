import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/lib/types/database";
import Image from "next/image";
import { BookOpen } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  isHebrew: boolean;
}

const categoryConfig: Record<string, { he: string; en: string; variant: "default" | "secondary" | "success" | "warning" }> = {
  thought: { he: "הגות", en: "Thought", variant: "default" },
  press: { he: "כתבות", en: "Press", variant: "secondary" },
  opinion: { he: "דעה", en: "Opinion", variant: "warning" },
  spirit: { he: "רוח", en: "Spirit", variant: "success" },
};

export function ArticleCard({ article, isHebrew }: ArticleCardProps) {
  const title = isHebrew ? article.title_he : article.title_en;
  const excerpt = isHebrew ? article.excerpt_he : article.excerpt_en;
  const cat = categoryConfig[article.category] || categoryConfig.thought;
  const displayFont = isHebrew
    ? "font-['Secular_One']"
    : "font-[family-name:var(--font-playfair)]";

  return (
    <Link
      href={`/magazine/${article.slug}`}
      className="group block card-organic overflow-hidden"
    >
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-sky-light/20 via-branch/[0.06] to-terracotta/[0.04]">
        {article.cover_image ? (
          <>
            <Image
              src={article.cover_image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-[1.04] transition-transform duration-600"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-branch/12" />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 start-3">
          <Badge variant={cat.variant} className="bg-white/90 backdrop-blur-sm text-xs shadow-sm">
            {isHebrew ? cat.he : cat.en}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className={`text-lg font-bold text-navy mb-2 group-hover:text-branch transition-colors duration-300 line-clamp-2 leading-snug ${displayFont}`}>
          {title}
        </h3>
        {excerpt && (
          <p className="text-sm text-ink-muted line-clamp-3 mb-4 leading-relaxed">{excerpt}</p>
        )}

        <div className="flex items-center justify-between">
          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-navy/[0.04] text-ink-muted/80">
                  {tag}
                </span>
              ))}
              {article.tags.length > 3 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-navy/[0.04] text-ink-muted/80">
                  +{article.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Date */}
          {article.published_at && (
            <span className="text-xs text-ink-muted/60 shrink-0 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-terracotta/30" />
              {new Date(article.published_at).toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
