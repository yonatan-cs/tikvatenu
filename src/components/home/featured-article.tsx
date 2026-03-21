import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/lib/types/database";
import Image from "next/image";
import { BookOpen, ArrowLeft, ArrowRight } from "lucide-react";

interface FeaturedArticleProps {
  article: Article;
  isHebrew: boolean;
}

const categoryConfig: Record<string, { he: string; en: string; variant: "default" | "secondary" | "success" | "warning" }> = {
  thought: { he: "הגות", en: "Thought", variant: "default" },
  press: { he: "כתבות", en: "Press", variant: "secondary" },
  opinion: { he: "דעה", en: "Opinion", variant: "warning" },
  spirit: { he: "רוח", en: "Spirit", variant: "success" },
};

export function FeaturedArticle({ article, isHebrew }: FeaturedArticleProps) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Image */}
        <div className="relative h-64 md:h-full min-h-[260px] overflow-hidden bg-gradient-to-br from-sky-light/20 via-branch/[0.06] to-terracotta/[0.04]">
          {article.cover_image ? (
            <>
              <Image
                src={article.cover_image}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-branch/15" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-7 md:p-10 flex flex-col justify-center">
          <Badge variant={cat.variant} className="w-fit mb-4">
            {isHebrew ? cat.he : cat.en}
          </Badge>

          <h3 className={`text-xl md:text-2xl font-bold text-navy mb-3 group-hover:text-branch transition-colors duration-300 leading-snug ${displayFont}`}>
            {title}
          </h3>

          {excerpt && (
            <p className="text-ink-muted mb-5 line-clamp-3 leading-relaxed">{excerpt}</p>
          )}

          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-branch group-hover:gap-2.5 transition-all duration-300">
            {isHebrew ? "קרא עוד" : "Read More"}
            {isHebrew ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </span>
        </div>
      </div>
    </Link>
  );
}
