"use client";

import { useState, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { saveArticle } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "./image-uploader";
import { RichTextEditor } from "./rich-text-editor";
import { Save, Loader2, X, Send } from "lucide-react";
import type { Article } from "@/lib/types/database";
import { toast } from "sonner";

interface ArticleFormProps {
  article?: Article;
  isHebrew: boolean;
  userId: string;
}

const categories = [
  { value: "thought", labelHe: "הגות", labelEn: "Thought" },
  { value: "press", labelHe: "כתבות", labelEn: "Press" },
  { value: "opinion", labelHe: "דעה", labelEn: "Opinion" },
  { value: "spirit", labelHe: "רוח", labelEn: "Spirit" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function ArticleForm({ article, isHebrew, userId }: ArticleFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [savingAction, setSavingAction] = useState<'save' | 'publish' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [titleHe, setTitleHe] = useState(article?.title_he || "");
  const [titleEn, setTitleEn] = useState(article?.title_en || "");
  const [excerptHe, setExcerptHe] = useState(article?.excerpt_he || "");
  const [excerptEn, setExcerptEn] = useState(article?.excerpt_en || "");
  const [bodyHe, setBodyHe] = useState(article?.body_he || "");
  const [bodyEn, setBodyEn] = useState(article?.body_en || "");
  const [coverImage, setCoverImage] = useState<string | null>(article?.cover_image || null);
  const [category, setCategory] = useState<string>(article?.category || "thought");
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [slug, setSlug] = useState(article?.slug || "");

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleAction(publish: boolean) {
    if (!formRef.current?.reportValidity()) return;

    setSavingAction(publish ? 'publish' : 'save');
    setError(null);

    try {
      const result = await saveArticle({
        id: article?.id,
        slug,
        titleHe,
        titleEn,
        excerptHe,
        excerptEn,
        bodyHe,
        bodyEn,
        coverImage,
        category,
        tags,
        isPublished: publish ? true : (article?.is_published || false),
        publishedAt: article?.published_at || null,
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success(publish
        ? isHebrew ? "המאמר פורסם בהצלחה" : "Article published successfully"
        : isHebrew ? "המאמר נשמר בהצלחה" : "Article saved successfully"
      );
      router.push("/admin/magazine");
      router.refresh();
    } catch {
      setError(isHebrew ? "שגיאה בשמירה" : "Error saving");
      toast.error(isHebrew ? "שגיאה בשמירה" : "Error saving");
    } finally {
      setSavingAction(null);
    }
  }

  return (
    <form ref={formRef} className="space-y-6 max-w-4xl">
      {/* Top bar */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-cream-dark/30 -mx-6 -mt-6 px-6 py-4 backdrop-blur-sm border-b border-branch/5">
        <h1 className={`text-xl font-bold text-navy ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
          {article
            ? isHebrew ? "עריכת מאמר" : "Edit Article"
            : isHebrew ? "מאמר חדש" : "New Article"
          }
        </h1>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" disabled={!!savingAction} onClick={() => handleAction(false)}>
            {savingAction === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savingAction === 'save'
              ? isHebrew ? "שומר..." : "Saving..."
              : article?.is_published
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
        <div className="bg-error/5 border border-error/20 rounded-lg p-3 text-sm text-error">{error}</div>
      )}

      {/* Cover Image */}
      <Card>
        <CardHeader>
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>{isHebrew ? "תמונת כיסוי" : "Cover Image"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader bucket="article-images" value={coverImage} onChange={setCoverImage} isHebrew={isHebrew} />
        </CardContent>
      </Card>

      {/* Category & Tags */}
      <Card>
        <CardHeader>
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>{isHebrew ? "סיווג" : "Classification"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5">{isHebrew ? "קטגוריה" : "Category"} *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {isHebrew ? cat.labelHe : cat.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} dir="ltr" placeholder={isHebrew ? "ייווצר אוטומטית" : "Auto-generated"} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="mb-1.5">{isHebrew ? "תגיות" : "Tags"}</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder={isHebrew ? "הוסיפו תגית..." : "Add a tag..."}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="default" onClick={addTag}>
                {isHebrew ? "הוסף" : "Add"}
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-navy/5 text-sm text-navy"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-error transition-colors cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
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
                <Input value={titleHe} onChange={(e) => setTitleHe(e.target.value)} dir="rtl" required placeholder="כותרת המאמר" />
              </div>
              <div>
                <Label className="mb-1.5">{isHebrew ? "תקציר" : "Excerpt"} (עברית)</Label>
                <Textarea value={excerptHe} onChange={(e) => setExcerptHe(e.target.value)} dir="rtl" placeholder="תקציר קצר שיופיע בכרטיס" rows={3} />
              </div>
              <div>
                <Label className="mb-1.5">{isHebrew ? "תוכן מלא" : "Full Content"} (עברית)</Label>
                <RichTextEditor content={bodyHe} onChange={setBodyHe} dir="rtl" />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <div>
                <Label className="mb-1.5">Title (English) *</Label>
                <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} dir="ltr" required placeholder="Article title" />
              </div>
              <div>
                <Label className="mb-1.5">Excerpt (English)</Label>
                <Textarea value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} dir="ltr" placeholder="Short excerpt for the card" rows={3} />
              </div>
              <div>
                <Label className="mb-1.5">Full Content (English)</Label>
                <RichTextEditor content={bodyEn} onChange={setBodyEn} dir="ltr" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </form>
  );
}
