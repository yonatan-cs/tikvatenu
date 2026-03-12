import { setRequestLocale } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/admin/event-form";
import type { Event, GalleryImage } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditEventPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale === "he" ? "" : locale + "/"}admin/login`);

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  // Fetch linked gallery album and images for past events
  let existingGalleryImages: GalleryImage[] = [];
  let existingAlbumId: string | undefined;

  const { data: albums } = await supabase
    .from("gallery_albums")
    .select("id")
    .eq("event_id", id);

  if (albums && albums.length > 0) {
    existingAlbumId = albums[0].id;
    const { data: images } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("album_id", existingAlbumId)
      .order("sort_order", { ascending: true });
    existingGalleryImages = (images || []) as GalleryImage[];
  }

  return (
    <EventForm
      event={event as Event}
      existingGalleryImages={existingGalleryImages}
      existingAlbumId={existingAlbumId}
      isHebrew={locale === "he"}
      userId={user.id}
    />
  );
}
