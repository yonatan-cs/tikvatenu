"use client";

import { useState } from "react";
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
import { RichTextEditor } from "./rich-text-editor";
import { RegistrationFieldBuilder } from "./registration-field-builder";
import { Save, Eye, Loader2 } from "lucide-react";
import type { Event, RegistrationField } from "@/lib/types/database";

interface EventFormProps {
  event?: Event;
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

export function EventForm({ event, isHebrew, userId }: EventFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const [isPublished, setIsPublished] = useState(event?.is_published || false);
  const [slug, setSlug] = useState(event?.slug || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const finalSlug = slug || slugify(titleEn || titleHe);

    const eventData = {
      slug: finalSlug,
      title_he: titleHe,
      title_en: titleEn,
      description_he: descriptionHe,
      description_en: descriptionEn,
      body_he: bodyHe || null,
      body_en: bodyEn || null,
      cover_image: coverImage,
      location_he: locationHe || null,
      location_en: locationEn || null,
      location_url: locationUrl || null,
      event_date: eventDate ? new Date(eventDate).toISOString() : new Date().toISOString(),
      event_end_date: eventEndDate ? new Date(eventEndDate).toISOString() : null,
      registration_deadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
      max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      registration_fields: registrationFields,
      is_published: isPublished,
      author_id: userId,
    };

    let result;
    if (event) {
      result = await supabase.from("events").update(eventData).eq("id", event.id);
    } else {
      result = await supabase.from("events").insert(eventData);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Top bar */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-cream-dark/30 -mx-6 -mt-6 px-6 py-4 backdrop-blur-sm border-b border-branch/5">
        <h1 className={`text-xl font-bold text-navy ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
          {event
            ? isHebrew ? "עריכת אירוע" : "Edit Event"
            : isHebrew ? "אירוע חדש" : "New Event"
          }
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <Label className="text-sm">{isHebrew ? "פורסם" : "Published"}</Label>
          </div>
          <Button type="submit" disabled={saving} variant="terracotta">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving
              ? isHebrew ? "שומר..." : "Saving..."
              : isHebrew ? "שמור" : "Save"
            }
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-error/5 border border-error/20 rounded-lg p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Cover Image */}
      <Card>
        <CardHeader>
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>
            {isHebrew ? "תמונת כיסוי" : "Cover Image"}
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

      {/* Registration Settings */}
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
    </form>
  );
}
