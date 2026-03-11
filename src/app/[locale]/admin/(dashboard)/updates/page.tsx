import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone, Pencil, Trash2 } from "lucide-react";
import type { Update } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminUpdatesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  const supabase = await createClient();
  const { data: updates } = await supabase
    .from("updates")
    .select("*")
    .order("created_at", { ascending: false });

  const typedUpdates = (updates || []) as Update[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-2xl font-bold text-navy ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
          {isHebrew ? "עדכונים" : "Updates"}
        </h1>
        <Button asChild variant="terracotta">
          <Link href="/admin/updates/new">
            <Plus className="w-4 h-4" />
            {isHebrew ? "עדכון חדש" : "New Update"}
          </Link>
        </Button>
      </div>

      {typedUpdates.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy/5 flex items-center justify-center">
            <Megaphone className="w-7 h-7 text-navy/30" />
          </div>
          <p className="text-ink-muted mb-4">{isHebrew ? "אין עדכונים עדיין" : "No updates yet"}</p>
          <Button asChild variant="outline">
            <Link href="/admin/updates/new">
              <Plus className="w-4 h-4" />
              {isHebrew ? "צרו את העדכון הראשון" : "Create your first update"}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {typedUpdates.map((update) => (
            <div
              key={update.id}
              className="flex items-center gap-4 bg-white rounded-xl border border-branch/5 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-navy truncate">
                    {isHebrew ? update.title_he : update.title_en}
                  </h3>
                  {!update.is_published && (
                    <Badge variant="outline">{isHebrew ? "טיוטה" : "Draft"}</Badge>
                  )}
                </div>
                <p className="text-xs text-ink-muted">
                  {update.published_at
                    ? new Date(update.published_at).toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : new Date(update.created_at).toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                  }
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/admin/updates/${update.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
