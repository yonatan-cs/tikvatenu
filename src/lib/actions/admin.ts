"use server";

import { createClient } from "@/lib/supabase/server";
import type { RegistrationField, GalleryImage } from "@/lib/types/database";

type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase: null, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "editor"].includes(profile.role)) {
    return { supabase: null, error: "Insufficient permissions" };
  }

  return { supabase, error: null, userId: user.id };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// --- saveEvent ---

export async function saveEvent(data: {
  id?: string;
  slug: string;
  titleHe: string;
  titleEn: string;
  descriptionHe: string;
  descriptionEn: string;
  bodyHe: string;
  bodyEn: string;
  coverImage: string | null;
  locationHe: string;
  locationEn: string;
  locationUrl: string;
  eventDate: string;
  eventEndDate: string;
  registrationDeadline: string;
  maxParticipants: string;
  registrationFields: RegistrationField[];
  isPublished: boolean;
  eventType: "future" | "past";
  summaryHe: string;
  summaryEn: string;
  galleryImages: GalleryImage[];
  existingGalleryImages: GalleryImage[];
  existingAlbumId?: string;
}): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (auth.error) return { ok: false, error: auth.error };
  const supabase = auth.supabase!;

  const isPast = data.eventType === "past";
  const finalSlug = data.slug || slugify(data.titleEn || data.titleHe);

  const eventData = {
    slug: finalSlug,
    title_he: data.titleHe,
    title_en: data.titleEn,
    description_he: data.descriptionHe,
    description_en: data.descriptionEn,
    body_he: data.bodyHe || null,
    body_en: data.bodyEn || null,
    cover_image: data.coverImage,
    location_he: data.locationHe || null,
    location_en: data.locationEn || null,
    location_url: data.locationUrl || null,
    event_date: data.eventDate ? new Date(data.eventDate).toISOString() : new Date().toISOString(),
    event_end_date: data.eventEndDate ? new Date(data.eventEndDate).toISOString() : null,
    registration_deadline: !isPast && data.registrationDeadline ? new Date(data.registrationDeadline).toISOString() : null,
    max_participants: !isPast && data.maxParticipants ? parseInt(data.maxParticipants) : null,
    registration_fields: !isPast ? data.registrationFields : [],
    is_published: data.isPublished,
    summary_he: isPast ? data.summaryHe || null : null,
    summary_en: isPast ? data.summaryEn || null : null,
    author_id: auth.userId!,
  };

  let eventId = data.id;

  if (data.id) {
    const { error: updateError } = await supabase.from("events").update(eventData).eq("id", data.id);
    if (updateError) return { ok: false, error: updateError.message };
  } else {
    const { data: newEvent, error: insertError } = await supabase
      .from("events")
      .insert(eventData)
      .select("id")
      .single();
    if (insertError || !newEvent) return { ok: false, error: insertError?.message || "Failed to create event" };
    eventId = newEvent.id;
  }

  // Save gallery images for past events
  if (isPast && eventId && data.galleryImages.length > 0) {
    let albumId = data.existingAlbumId;

    if (!albumId) {
      const { data: newAlbum, error: albumError } = await supabase
        .from("gallery_albums")
        .insert({
          title_he: data.titleHe,
          title_en: data.titleEn || null,
          description_he: null,
          description_en: null,
          cover_image: data.galleryImages[0]?.image_url || null,
          event_id: eventId,
          is_published: true,
          sort_order: 0,
          author_id: auth.userId!,
        })
        .select("id")
        .single();

      if (albumError || !newAlbum) return { ok: false, error: albumError?.message || "Failed to create gallery album" };
      albumId = newAlbum.id;
    } else {
      await supabase.from("gallery_albums").update({
        cover_image: data.galleryImages[0]?.image_url || null,
      }).eq("id", albumId);
    }

    // Sync images: delete removed, insert new
    const currentImageIds = data.galleryImages
      .filter((img) => data.existingGalleryImages.some((e) => e.id === img.id))
      .map((img) => img.id);
    const removedIds = data.existingGalleryImages
      .filter((e) => !currentImageIds.includes(e.id))
      .map((e) => e.id);

    if (removedIds.length > 0) {
      await supabase.from("gallery_images").delete().in("id", removedIds);
    }

    const newImages = data.galleryImages.filter(
      (img) => !data.existingGalleryImages.some((e) => e.id === img.id)
    );
    if (newImages.length > 0) {
      await supabase.from("gallery_images").insert(
        newImages.map((img, idx) => ({
          album_id: albumId,
          image_url: img.image_url,
          caption_he: img.caption_he,
          caption_en: img.caption_en,
          sort_order: data.existingGalleryImages.length + idx,
        }))
      );
    }
  }

  return { ok: true, id: eventId };
}

// --- saveArticle ---

export async function saveArticle(data: {
  id?: string;
  slug: string;
  titleHe: string;
  titleEn: string;
  excerptHe: string;
  excerptEn: string;
  bodyHe: string;
  bodyEn: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
}): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (auth.error) return { ok: false, error: auth.error };
  const supabase = auth.supabase!;

  const finalSlug = data.slug || slugify(data.titleEn || data.titleHe);

  const articleData = {
    slug: finalSlug,
    title_he: data.titleHe,
    title_en: data.titleEn,
    excerpt_he: data.excerptHe || null,
    excerpt_en: data.excerptEn || null,
    body_he: data.bodyHe || null,
    body_en: data.bodyEn || null,
    cover_image: data.coverImage,
    category: data.category,
    tags: data.tags,
    is_published: data.isPublished,
    published_at: data.isPublished ? (data.publishedAt || new Date().toISOString()) : null,
    author_id: auth.userId!,
  };

  if (data.id) {
    const { error } = await supabase.from("articles").update(articleData).eq("id", data.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("articles").insert(articleData);
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true };
}

// --- saveUpdate ---

export async function saveUpdate(data: {
  id?: string;
  slug: string;
  titleHe: string;
  titleEn: string;
  bodyHe: string;
  bodyEn: string;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: string | null;
}): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (auth.error) return { ok: false, error: auth.error };
  const supabase = auth.supabase!;

  const finalSlug = data.slug || slugify(data.titleEn || data.titleHe);

  const updateData = {
    slug: finalSlug,
    title_he: data.titleHe,
    title_en: data.titleEn,
    body_he: data.bodyHe || null,
    body_en: data.bodyEn || null,
    cover_image: data.coverImage,
    is_published: data.isPublished,
    published_at: data.isPublished ? (data.publishedAt || new Date().toISOString()) : null,
    author_id: auth.userId!,
  };

  if (data.id) {
    const { error } = await supabase.from("updates").update(updateData).eq("id", data.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("updates").insert(updateData);
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true };
}

// --- saveGalleryAlbum ---

export async function saveGalleryAlbum(data: {
  id?: string;
  titleHe: string;
  titleEn: string;
  descriptionHe: string;
  descriptionEn: string;
  coverImage: string | null;
  eventId: string;
  isPublished: boolean;
  sortOrder: number;
  images: GalleryImage[];
  existingImages: GalleryImage[];
}): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (auth.error) return { ok: false, error: auth.error };
  const supabase = auth.supabase!;

  const albumData = {
    title_he: data.titleHe,
    title_en: data.titleEn,
    description_he: data.descriptionHe || null,
    description_en: data.descriptionEn || null,
    cover_image: data.coverImage || data.images[0]?.image_url || null,
    event_id: data.eventId === "none" ? null : data.eventId,
    is_published: data.isPublished,
    sort_order: data.sortOrder,
    author_id: auth.userId!,
  };

  let albumId = data.id;

  if (data.id) {
    const { error: updateError } = await supabase.from("gallery_albums").update(albumData).eq("id", data.id);
    if (updateError) return { ok: false, error: updateError.message };
  } else {
    const { data: newAlbum, error: insertError } = await supabase
      .from("gallery_albums")
      .insert(albumData)
      .select("id")
      .single();
    if (insertError || !newAlbum) return { ok: false, error: insertError?.message || "Failed to create album" };
    albumId = newAlbum.id;
  }

  // Sync images
  if (albumId) {
    const currentImageIds = data.images.filter((img) => data.existingImages.some((e) => e.id === img.id)).map((img) => img.id);
    const removedIds = data.existingImages.filter((e) => !currentImageIds.includes(e.id)).map((e) => e.id);
    if (removedIds.length > 0) {
      await supabase.from("gallery_images").delete().in("id", removedIds);
    }

    const newImages = data.images.filter((img) => !data.existingImages.some((e) => e.id === img.id));
    if (newImages.length > 0) {
      await supabase.from("gallery_images").insert(
        newImages.map((img, idx) => ({
          album_id: albumId,
          image_url: img.image_url,
          caption_he: img.caption_he,
          caption_en: img.caption_en,
          sort_order: data.existingImages.length + idx,
        }))
      );
    }
  }

  return { ok: true, id: albumId };
}

// --- saveHomeSettings ---

export async function saveHomeSettings(data: {
  featuredArticleId: string;
  instagramUrl: string;
}): Promise<ActionResult> {
  const auth = await verifyAdmin();
  if (auth.error) return { ok: false, error: auth.error };
  const supabase = auth.supabase!;

  const settingsToSave = [
    { key: "featured_article_id", value: data.featuredArticleId === "none" ? null : data.featuredArticleId },
    { key: "instagram_url", value: data.instagramUrl || null },
  ];

  for (const setting of settingsToSave) {
    const { error: upsertError } = await supabase
      .from("site_settings")
      .upsert(
        { key: setting.key, value: setting.value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (upsertError) return { ok: false, error: upsertError.message };
  }

  return { ok: true };
}
