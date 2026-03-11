import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HomeSettingsForm } from "@/components/admin/home-settings-form";
import type { Article } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminHomeSettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale === "he" ? "" : locale + "/"}admin/login`);

  // Get current settings
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*");

  const settingsMap: Record<string, unknown> = {};
  (settings || []).forEach((s: { key: string; value: unknown }) => {
    settingsMap[s.key] = s.value;
  });

  // Get published articles for featured selection
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title_he, title_en, slug")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <HomeSettingsForm
      settings={settingsMap}
      articles={(articles || []) as Pick<Article, "id" | "title_he" | "title_en" | "slug">[]}
      isHebrew={locale === "he"}
    />
  );
}
