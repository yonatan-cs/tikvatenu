"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveEvent } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "./image-uploader";
import { RichTextEditor } from "./rich-text-editor";
import { RegistrationFieldBuilder } from "./registration-field-builder";
import { Save, Loader2, Upload, X, CalendarCheck, History, Send } from "lucide-react";
import type { Event, RegistrationField, GalleryImage } from "@/lib/types/database";
import Image from "next/image";
import { toast } from "sonner";

type EventType = "future" | "past";

interface EventFormProps {
  event?: Event;
  existingGalleryImages?: GalleryImage[];
  existingAlbumId?: string;
  isHebrew: boolean;
  userId: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function deriveEventType(event?: Event): EventType {
  if (!event) return "future";
  return new Date(event.event_date) < new Date() ? "past" : "future";
}

export function EventForm({ event, existingGalleryImages = [], existingAlbumId, isHebrew, userId }: EventFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [savingAction, setSavingAction] = useState<'save' | 'publish' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Event type
  const [eventType, setEventType] = useState<EventType>(deriveEventType(event));

  // Form state
  const [titleHe, setTitleHe] = useState(event?.title_he || "");
  const [titleEn, setTitleEn] = useState(event?.title_en || "");
  const [descriptionHe, setDescriptionHe] = useState(event?.description_he || "");
  const [descriptionEn, setDescriptionEn] = useState(event?.description_en || "");
  const [bodyHe, setBodyHe] = useState(event?.body_he || "");
  const [bodyEn, setBodyEn] = useState(event?.body_en || "");
  const [coverImage, setCoverImage] = useState<string | null>(event?.cover_image || null);
  const [locationHe, setLocationHe] = useState(event?.location_he || "");
  const [locationEn, setLocationEn] = useState(event?.location_en || "");
  const [locationUrl, setLocationUrl] = useState(event?.location_url || "");
  const [eventDate, setEventDate] = useState(event?.event_date?.slice(0, 16) || "");
  const [eventEndDate, setEventEndDate] = useState(event?.event_end_date?.slice(0, 16) || "");
  const [registrationDeadline, setRegistrationDeadline] = useState(event?.registration_deadline?.slice(0, 16) || "");
  const [maxParticipants, setMaxParticipants] = useState(event?.max_participants?.toString() || "");
  const [registrationFields, setRegistrationFields] = useState<RegistrationField[]>(
    event?.registration_fields || []
  );
  const [slug, setSlug] = useState(event?.slug || "");

  // Gallery images for past events
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(existingGalleryImages);
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
          album_id: existingAlbumId || "",
          image_url: data.publicUrl,
          caption_he: null,
          caption_en: null,
          sort_order: galleryImages.length + newImages.length,
          created_at: new Date().toISOString(),
        });
      }
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setGalleryImages((prev) => [...prev, ...newImages]);
    setUploading(false);
  }, [existingAlbumId, galleryImages.length]);

  function removeImage(imageId: string) {
    setGalleryImages(galleryImages.filter((img) => img.id !== imageId));
  }

  async function handleAction(publish: boolean) {
    if (!formRef.current?.reportValidity()) return;

    setSavingAction(publish ? 'publish' : 'save');
    setError(null);

    try {
      const result = await saveEvent({
        id: event?.id,
        slug,
        titleHe,
        titleEn,
        descriptionHe,
        descriptionEn,
        bodyHe,
        bodyEn,
        coverImage,
        locationHe,
        locationEn,
        locationUrl,
        eventDate,
        eventEndDate,
        registrationDeadline,
        maxParticipants,
        registrationFields,
        isPublished: publish ? true : (event?.is_published || false),
        eventType,
        summaryHe: "",
        summaryEn: "",
        galleryImages,
        existingGalleryImages,
        existingAlbumId,
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success(publish
        ? isHebrew ? "האירוע פורסם בהצלחה" : "Event published successfully"
        : isHebrew ? "האירוע נשמר בהצלחה" : "Event saved successfully"
      );
      router.push("/admin/events");
      router.refresh();
    } catch {
      setError(isHebrew ? "שגיאה בשמירה" : "Error saving");
      toast.error(isHebrew ? "שגיאה בשמירה" : "Error saving");
    } finally {
      setSavingAction(null);
    }
  }

  const isPast = eventType === "past";

  return (
    <form ref={formRef} className="space-y-6 max-w-4xl">
      {/* Top bar */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-cream-dark/30 -mx-6 -mt-6 px-6 py-4 backdrop-blur-sm border-b border-branch/5">
        <h1 className={`text-xl font-bold text-navy ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
          {event
            ? isHebrew ? "עריכת אירוע" : "Edit Event"
            : isHebrew ? "אירוע חדש" : "New Event"
          }
        </h1>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" disabled={!!savingAction} onClick={() => handleAction(false)}>
            {savingAction === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savingAction === 'save'
              ? isHebrew ? "שומר..." : "Saving..."
              : event?.is_published
                ? isHebrew ? "שמור" : "Save"
                : isHebrew ? "שמור טיוטה" : "Save Draft"
            }
          </Button>
          <Button type="button" variant="terracotta" disabled={!!savingAction} onClick={() => handleAction(true)}>
            {savingAction === 'publish' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {savingAction === 'publish'
              ? isHebrew ? "מפרסם..." : "Publishing..."
              : isHebrew ? "פרסם" : "Publish"
            }
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-error/5 border border-error/20 rounded-lg p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Event Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>
            {isHebrew ? "סוג אירוע" : "Event Type"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setEventType("future")}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                eventType === "future"
                  ? "border-branch bg-branch/5"
                  : "border-branch/10 hover:border-branch/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                eventType === "future" ? "bg-branch/20" : "bg-branch/5"
              }`}>
                <CalendarCheck className={`w-5 h-5 ${eventType === "future" ? "text-branch" : "text-ink-muted"}`} />
              </div>
              <div className="text-start">
                <p className={`font-medium text-sm ${eventType === "future" ? "text-navy" : "text-ink-muted"}`}>
                  {isHebrew ? "אירוע עתידי" : "Future Event"}
                </p>
                <p className="text-xs text-ink-muted">
                  {isHebrew ? "עם טופס הרשמה" : "With registration form"}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setEventType("past")}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                eventType === "past"
                  ? "border-branch bg-branch/5"
                  : "border-branch/10 hover:border-branch/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                eventType === "past" ? "bg-branch/20" : "bg-branch/5"
              }`}>
                <History className={`w-5 h-5 ${eventType === "past" ? "text-branch" : "text-ink-muted"}`} />
              </div>
              <div className="text-start">
                <p className={`font-medium text-sm ${eventType === "past" ? "text-navy" : "text-ink-muted"}`}>
                  {isHebrew ? "סיכום אירוע" : "Event Summary"}
                </p>
                <p className="text-xs text-ink-muted">
                  {isHebrew ? "אירוע שהיה כבר" : "Past event recap"}
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Cover Image */}
      <Card>
        <CardHeader>
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>
            {isPast
              ? isHebrew ? "תמונת כיסוי" : "Cover Image"
              : isHebrew ? "תמונה / פלייר" : "Image / Flyer"
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader
            bucket="event-images"
            value={coverImage}
            onChange={setCoverImage}
            isHebrew={isHebrew}
          />
        </CardContent>
      </Card>

      {/* Bilingual Content */}
      <Card>
        <CardHeader>
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>
            {isHebrew ? "תוכן" : "Content"}
          </CardTitle>
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
                <Input
                  value={titleHe}
                  onChange={(e) => setTitleHe(e.target.value)}
                  dir="rtl"
                  required
                  placeholder="כותרת האירוע"
                />
              </div>
              <div>
                <Label className="mb-1.5">{isHebrew ? "תיאור קצר" : "Short Description"} (עברית) *</Label>
                <Textarea
                  value={descriptionHe}
                  onChange={(e) => setDescriptionHe(e.target.value)}
                  dir="rtl"
                  required
                  placeholder="תיאור קצר שיופיע בכרטיס האירוע"
                  rows={3}
                />
              </div>
              <div>
                <Label className="mb-1.5">{isHebrew ? "תוכן מלא" : "Full Content"} (עברית)</Label>
                <RichTextEditor
                  content={bodyHe}
                  onChange={setBodyHe}
                  dir="rtl"
                  placeholder="תוכן מפורט על האירוע..."
                />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <div>
                <Label className="mb-1.5">Title (English) *</Label>
                <Input
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  dir="ltr"
                  required
                  placeholder="Event title"
                />
              </div>
              <div>
                <Label className="mb-1.5">Short Description (English) *</Label>
                <Textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  dir="ltr"
                  required
                  placeholder="Short description for the event card"
                  rows={3}
                />
              </div>
              <div>
                <Label className="mb-1.5">Full Content (English)</Label>
                <RichTextEditor
                  content={bodyEn}
                  onChange={setBodyEn}
                  dir="ltr"
                  placeholder="Detailed event content..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>
            {isHebrew ? "פרטי אירוע" : "Event Details"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5">{isHebrew ? "תאריך ושעה" : "Date & Time"} *</Label>
              <Input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="mb-1.5">{isHebrew ? "תאריך סיום" : "End Date"}</Label>
              <Input
                type="datetime-local"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5">{isHebrew ? "מיקום (עברית)" : "Location (Hebrew)"}</Label>
              <Input
                value={locationHe}
                onChange={(e) => setLocationHe(e.target.value)}
                dir="rtl"
                placeholder={isHebrew ? "מיקום האירוע" : "Event location"}
              />
            </div>
            <div>
              <Label className="mb-1.5">{isHebrew ? "מיקום (אנגלית)" : "Location (English)"}</Label>
              <Input
                value={locationEn}
                onChange={(e) => setLocationEn(e.target.value)}
                dir="ltr"
                placeholder="Event location"
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5">{isHebrew ? "קישור למיקום" : "Location URL"}</Label>
            <Input
              type="url"
              value={locationUrl}
              onChange={(e) => setLocationUrl(e.target.value)}
              dir="ltr"
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div>
            <Label className="mb-1.5">Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              dir="ltr"
              placeholder={isHebrew ? "ייווצר אוטומטית מהכותרת" : "Auto-generated from title"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Registration Settings - Only for future events */}
      {!isPast && (
        <Card>
          <CardHeader>
            <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>
              {isHebrew ? "הגדרות הרשמה" : "Registration Settings"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5">{isHebrew ? "מועד אחרון להרשמה" : "Registration Deadline"}</Label>
                <Input
                  type="datetime-local"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5">{isHebrew ? "מקסימום משתתפים" : "Max Participants"}</Label>
                <Input
                  type="number"
                  min="0"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  placeholder={isHebrew ? "ללא הגבלה" : "Unlimited"}
                />
              </div>
            </div>

            <div className="pt-2">
              <RegistrationFieldBuilder
                fields={registrationFields}
                onChange={setRegistrationFields}
                isHebrew={isHebrew}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Photos - Only for past events */}
      {isPast && (
        <Card>
          <CardHeader>
            <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>
              {isHebrew ? "תמונות מהאירוע" : "Event Photos"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Upload area */}
            <label className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-branch/20 hover:border-branch/40 hover:bg-cream-dark/30 cursor-pointer transition-all duration-200 mb-4">
              {uploading ? (
                <>
                  <div className="w-8 h-8 border-2 border-branch/30 border-t-branch rounded-full animate-spin" />
                  <span className="text-sm text-ink-muted">
                    {isHebrew ? `מעלה... ${uploadProgress}%` : `Uploading... ${uploadProgress}%`}
                  </span>
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
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {galleryImages.map((img) => (
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

            {galleryImages.length === 0 && !uploading && (
              <p className="text-center text-sm text-ink-muted py-4">
                {isHebrew ? "אין תמונות עדיין" : "No photos yet"}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </form>
  );
}
