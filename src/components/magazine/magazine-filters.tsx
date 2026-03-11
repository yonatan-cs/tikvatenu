"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface MagazineFiltersProps {
  activeCategory: string;
  activeTag: string;
  allTags: string[];
  isHebrew: boolean;
}

const categories = [
  { value: "all", labelHe: "הכל", labelEn: "All" },
  { value: "thought", labelHe: "הגות", labelEn: "Thought" },
  { value: "press", labelHe: "כתבות", labelEn: "Press" },
  { value: "opinion", labelHe: "דעה", labelEn: "Opinion" },
  { value: "spirit", labelHe: "רוח", labelEn: "Spirit" },
];

export function MagazineFilters({ activeCategory, activeTag, allTags, isHebrew }: MagazineFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Clear tag when changing category
    if (key === "category") {
      params.delete("tag");
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  return (
    <div className="mb-8 space-y-4">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter("category", cat.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer",
              activeCategory === cat.value
                ? "bg-navy text-parchment"
                : "bg-navy/5 text-navy/70 hover:bg-navy/10"
            )}
          >
            {isHebrew ? cat.labelHe : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter("tag", activeTag === tag ? "" : tag)}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-colors cursor-pointer",
                activeTag === tag
                  ? "bg-branch text-white"
                  : "bg-branch/5 text-branch hover:bg-branch/10"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
