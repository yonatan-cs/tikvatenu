"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { saveUpdate } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "./image-uploader";
import { RichTextEditor } from "./rich-text-editor";
import { Save, Loader2 } from "lucide-react";
import type { Update } from "@/lib/types/database";

interface UpdateFormProps {
  update?: Update;
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

export function UpdateForm({ update, isHebrew, userId }: UpdateFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titleHe, setTitleHe] = useState(update?.title_he || "");
  const [titleEn, setTitleEn] = useState(update?.title_en || "");
  const [bodyHe, setBodyHe] = useState(update?.body_he || "");
  const [bodyEn, setBodyEn] = useState(update?.body_en || "");
  const [coverImage, setCoverImage] = useState<string | null>(update?.cover_image || null);
  const [isPublished, setIsPublished] = useState(update?.is_published || false);
  const [slug, setSlug] = useState(update?.slug || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const result = await saveUpdate({
      id: update?.id,
      slug,
      titleHe,
      titleEn,
      bodyHe,
      bodyEn,
      coverImage,
      isPublished,
      publishedAt: update?.published_at || null,
    });

    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }

    router.push("/admin/updates");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Top bar */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-cream-dark/30 -mx-6 -mt-6 px-6 py-4 backdrop-blur-sm border-b border-branch/5">
        <h1 className={`text-xl font-bold text-navy ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
          {update
            ? isHebrew ? "עריכת עדכון" : "Edit Update"
            : isHebrew ? "עדכון חדש" : "New Update"
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
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>{isHebrew ? "תמונה" : "Image"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader bucket="general" value={coverImage} onChange={setCoverImage} isHebrew={isHebrew} />
        </CardContent>
      </Card>

      {/* Slug */}
      <Card>
        <CardContent className="pt-6">
          <Label className="mb-1.5">Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} dir="ltr" placeholder={isHebrew ? "ייווצר אוטומטית" : "Auto-generated"} />
        </CardContent>
      </Card>

      {/* Bilingual Content */}
      <Card>
        <CardHeader>
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>{isHebrew ? "תוכן" : "Content"}</CardTitle>
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
                <Input value={titleHe} onChange={(e) => setTitleHe(e.target.value)} dir="rtl" required placeholder="כותרת העדכון" />
              </div>
              <div>
                <Label className="mb-1.5">{isHebrew ? "תוכן" : "Content"} (עברית)</Label>
                <RichTextEditor content={bodyHe} onChange={setBodyHe} dir="rtl" />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <div>
                <Label className="mb-1.5">Title (English) *</Label>
                <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} dir="ltr" required placeholder="Update title" />
              </div>
              <div>
                <Label className="mb-1.5">Content (English)</Label>
                <RichTextEditor content={bodyEn} onChange={setBodyEn} dir="ltr" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </form>
  );
}
