"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "./image-uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2, Upload, X } from "lucide-react";
import type { GalleryAlbum, GalleryImage, Event } from "@/lib/types/database";
import Image from "next/image";

interface GalleryFormProps {
  album?: GalleryAlbum;
  existingImages?: GalleryImage[];
  events?: Pick<Event, "id" | "title_he" | "title_en">[];
  isHebrew: boolean;
  userId: string;
}

export function GalleryForm({ album, existingImages = [], events = [], isHebrew, userId }: GalleryFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titleHe, setTitleHe] = useState(album?.title_he || "");
  const [titleEn, setTitleEn] = useState(album?.title_en || "");
  const [descriptionHe, setDescriptionHe] = useState(album?.description_he || "");
  const [descriptionEn, setDescriptionEn] = useState(album?.description_en || "");
  const [coverImage, setCoverImage] = useState<string | null>(album?.cover_image || null);
  const [eventId, setEventId] = useState<string>(album?.event_id || "none");
  const [isPublished, setIsPublished] = useState(album?.is_published || false);

  // Image management
  const [images, setImages] = useState<GalleryImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImages = useCallback(async (files: FileList) => {
    setUploading(true);
    setUploadProgress(0);
    const supabase = createClient();
    const newImages: GalleryImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue;

      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (!uploadError) {
        const { data } = supabase.storage.from("gallery-images").getPublicUrl(fileName);
        newImages.push({
          id: crypto.randomUUID(),
          album_id: album?.id || "",
          image_url: data.publicUrl,
          caption_he: null,
          caption_en: null,
          sort_order: images.length + newImages.length,
          created_at: new Date().toISOString(),
        });
      }
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setImages((prev) => [...prev, ...newImages]);
    setUploading(false);
  }, [album?.id, images.length]);

  function removeImage(imageId: string) {
    setImages(images.filter((img) => img.id !== imageId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();

    const albumData = {
      title_he: titleHe,
      title_en: titleEn,
      description_he: descriptionHe || null,
      description_en: descriptionEn || null,
      cover_image: coverImage || images[0]?.image_url || null,
      event_id: eventId === "none" ? null : eventId,
      is_published: isPublished,
      sort_order: album?.sort_order || 0,
      author_id: userId,
    };

    let albumId = album?.id;

    if (album) {
      const { error: updateError } = await supabase.from("gallery_albums").update(albumData).eq("id", album.id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { data: newAlbum, error: insertError } = await supabase
        .from("gallery_albums")
        .insert(albumData)
        .select("id")
        .single();
      if (insertError || !newAlbum) {
        setError(insertError?.message || "Failed to create album");
        setSaving(false);
        return;
      }
      albumId = newAlbum.id;
    }

    // Sync images
    if (albumId) {
      // Delete removed images
      const currentImageIds = images.filter((img) => existingImages.some((e) => e.id === img.id)).map((img) => img.id);
      const removedIds = existingImages.filter((e) => !currentImageIds.includes(e.id)).map((e) => e.id);
      if (removedIds.length > 0) {
        await supabase.from("gallery_images").delete().in("id", removedIds);
      }

      // Insert new images
      const newImages = images.filter((img) => !existingImages.some((e) => e.id === img.id));
      if (newImages.length > 0) {
        await supabase.from("gallery_images").insert(
          newImages.map((img, idx) => ({
            album_id: albumId,
            image_url: img.image_url,
            caption_he: img.caption_he,
            caption_en: img.caption_en,
            sort_order: existingImages.length + idx,
          }))
        );
      }
    }

    router.push("/admin/gallery");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Top bar */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-cream-dark/30 -mx-6 -mt-6 px-6 py-4 backdrop-blur-sm border-b border-branch/5">
        <h1 className={`text-xl font-bold text-navy ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
          {album
            ? isHebrew ? "עריכת אלבום" : "Edit Album"
            : isHebrew ? "אלבום חדש" : "New Album"
          }
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <Label className="text-sm">{isHebrew ? "פורסם" : "Published"}</Label>
          </div>
          <Button type="submit" disabled={saving} variant="terracotta">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? (isHebrew ? "שומר..." : "Saving...") : (isHebrew ? "שמור" : "Save")}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-error/5 border border-error/20 rounded-lg p-3 text-sm text-error">{error}</div>
      )}

      {/* Cover Image */}
      <Card>
        <CardHeader>
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>{isHebrew ? "תמונת כיסוי" : "Cover Image"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader bucket="gallery-images" value={coverImage} onChange={setCoverImage} isHebrew={isHebrew} />
        </CardContent>
      </Card>

      {/* Link to Event */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>{isHebrew ? "קישור לאירוע" : "Link to Event"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="mb-1.5">{isHebrew ? "אירוע מקושר (אופציונלי)" : "Linked event (optional)"}</Label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{isHebrew ? "ללא אירוע" : "No event"}</SelectItem>
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {isHebrew ? ev.title_he : ev.title_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Bilingual Content */}
      <Card>
        <CardHeader>
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>{isHebrew ? "פרטי אלבום" : "Album Details"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="he" className="w-full">
            <TabsList>
              <TabsTrigger value="he">עברית</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>

            <TabsContent value="he" className="space-y-4">
              <div>
                <Label className="mb-1.5">{isHebrew ? "כותרת" : "Title"} (עברית) *</Label>
                <Input value={titleHe} onChange={(e) => setTitleHe(e.target.value)} dir="rtl" required placeholder="כותרת האלבום" />
              </div>
              <div>
                <Label className="mb-1.5">{isHebrew ? "תיאור" : "Description"} (עברית)</Label>
                <Textarea value={descriptionHe} onChange={(e) => setDescriptionHe(e.target.value)} dir="rtl" placeholder="תיאור קצר" rows={3} />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <div>
                <Label className="mb-1.5">Title (English) *</Label>
                <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} dir="ltr" required placeholder="Album title" />
              </div>
              <div>
                <Label className="mb-1.5">Description (English)</Label>
                <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} dir="ltr" placeholder="Short description" rows={3} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>{isHebrew ? "תמונות" : "Photos"}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Upload area */}
          <label className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-branch/20 hover:border-branch/40 hover:bg-cream-dark/30 cursor-pointer transition-all duration-200 mb-4">
            {uploading ? (
              <>
                <div className="w-8 h-8 border-2 border-branch/30 border-t-branch rounded-full animate-spin" />
                <span className="text-sm text-ink-muted">{isHebrew ? `מעלה... ${uploadProgress}%` : `Uploading... ${uploadProgress}%`}</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-branch/40" />
                <span className="text-sm font-medium text-navy">
                  {isHebrew ? "בחרו תמונות להעלאה (ניתן לבחור מספר תמונות)" : "Select images to upload (multiple allowed)"}
                </span>
                <span className="text-xs text-ink-muted">PNG, JPG, WebP (max 5MB each)</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && uploadImages(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* Image grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-branch/10">
                  <Image
                    src={img.image_url}
                    alt=""
                    width={200}
                    height={150}
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1.5 end-1.5 p-1 rounded-full bg-navy/70 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && !uploading && (
            <p className="text-center text-sm text-ink-muted py-4">
              {isHebrew ? "אין תמונות עדיין" : "No photos yet"}
            </p>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
