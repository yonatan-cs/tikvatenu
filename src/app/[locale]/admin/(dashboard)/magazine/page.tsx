import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Pencil, ExternalLink } from "lucide-react";
import type { Article } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string }>;
};

const categoryLabels: Record<string, { he: string; en: string; variant: "default" | "secondary" | "success" | "warning" }> = {
  thought: { he: "הגות", en: "Thought", variant: "default" },
  press: { he: "כתבות", en: "Press", variant: "secondary" },
  opinion: { he: "דעה", en: "Opinion", variant: "warning" },
  spirit: { he: "רוח", en: "Spirit", variant: "success" },
};

export default async function AdminMagazinePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  const typedArticles = (articles || []) as Article[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-2xl font-bold text-navy ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
          {isHebrew ? "מגזין" : "Magazine"}
        </h1>
        <Button asChild variant="terracotta">
          <Link href="/admin/magazine/new">
            <Plus className="w-4 h-4" />
            {isHebrew ? "מאמר חדש" : "New Article"}
          </Link>
        </Button>
      </div>

      {typedArticles.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy/5 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-navy/30" />
          </div>
          <p className="text-ink-muted mb-4">{isHebrew ? "אין מאמרים עדיין" : "No articles yet"}</p>
          <Button asChild variant="outline">
            <Link href="/admin/magazine/new">
              <Plus className="w-4 h-4" />
              {isHebrew ? "צרו את המאמר הראשון" : "Create your first article"}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {typedArticles.map((article) => {
            const cat = categoryLabels[article.category] || categoryLabels.thought;
            return (
              <div
                key={article.id}
                className="flex items-center gap-4 bg-white rounded-xl border border-branch/5 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-navy truncate">
                      {isHebrew ? article.title_he : article.title_en}
                    </h3>
                    <Badge variant={cat.variant}>{isHebrew ? cat.he : cat.en}</Badge>
                    {!article.is_published && (
                      <Badge variant="outline">{isHebrew ? "טיוטה" : "Draft"}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-ink-muted truncate">
                    {isHebrew ? article.excerpt_he : article.excerpt_en}
                  </p>
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {article.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-navy/3 text-ink-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/admin/magazine/${article.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </Button>
                  {article.is_published && (
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/magazine/${article.slug}`}>
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
