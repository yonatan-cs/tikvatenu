import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GalleryForm } from "@/components/admin/gallery-form";
import type { Event } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewAlbumPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale === "he" ? "" : locale + "/"}admin/login`);

  const { data: events } = await supabase
    .from("events")
    .select("id, title_he, title_en")
    .order("event_date", { ascending: false });

  return (
    <GalleryForm
      events={(events || []) as Pick<Event, "id" | "title_he" | "title_en">[]}
      isHebrew={locale === "he"}
      userId={user.id}
    />
  );
}
