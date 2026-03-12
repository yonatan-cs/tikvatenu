import type { Update } from "@/lib/types/database";
import Image from "next/image";
import { Megaphone } from "lucide-react";
import { SafeHtml } from "@/components/shared/safe-html";

interface UpdatesFeedProps {
  updates: Update[];
  isHebrew: boolean;
}

export function UpdatesFeed({ updates, isHebrew }: UpdatesFeedProps) {
  const displayFont = isHebrew
    ? "font-['Secular_One']"
    : "font-[family-name:var(--font-playfair)]";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
      {updates.map((update, i) => {
        const title = isHebrew ? update.title_he : update.title_en;
        const body = isHebrew ? update.body_he : update.body_en;

        return (
          <div
            key={update.id}
            className="card-organic overflow-hidden group"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {/* Cover image */}
            {update.cover_image ? (
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={update.cover_image}
                  alt={title}
                  fill
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ) : (
              <div className="h-36 bg-gradient-to-br from-sky-light/20 via-branch/[0.06] to-terracotta/[0.04] flex items-center justify-center relative">
                <Megaphone className="w-8 h-8 text-branch/15" />
                {/* Decorative dots */}
                <div className="absolute top-4 end-4 flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-branch/10" />
                  <span className="w-1.5 h-1.5 rounded-full bg-branch/[0.07]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-branch/[0.04]" />
                </div>
              </div>
            )}

            <div className="p-6">
              <h3 className={`text-lg font-bold text-navy mb-2.5 leading-snug ${displayFont}`}>
                {title}
              </h3>

              {body && (
                <SafeHtml
                  html={body}
                  className="text-sm text-ink-muted line-clamp-3 prose prose-sm max-w-none leading-relaxed"
                />
              )}

              {update.published_at && (
                <p className="text-xs text-ink-muted/70 mt-4 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-terracotta/40" />
                  {new Date(update.published_at).toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
