import { setRequestLocale } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GalleryForm } from "@/components/admin/gallery-form";
import type { GalleryAlbum, GalleryImage, Event } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditAlbumPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale === "he" ? "" : locale + "/"}admin/login`);

  const { data: album } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("id", id)
    .single();

  if (!album) notFound();

  const { data: images } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("album_id", id)
    .order("sort_order", { ascending: true });

  const { data: events } = await supabase
    .from("events")
    .select("id, title_he, title_en")
    .order("event_date", { ascending: false });

  return (
    <GalleryForm
      album={album as GalleryAlbum}
      existingImages={(images || []) as GalleryImage[]}
      events={(events || []) as Pick<Event, "id" | "title_he" | "title_en">[]}
      isHebrew={locale === "he"}
      userId={user.id}
    />
  );
}
