"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { saveHomeSettings } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import type { Article } from "@/lib/types/database";

interface HomeSettingsFormProps {
  settings: Record<string, unknown>;
  articles: Pick<Article, "id" | "title_he" | "title_en" | "slug">[];
  isHebrew: boolean;
}

export function HomeSettingsForm({ settings, articles, isHebrew }: HomeSettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [featuredArticleId, setFeaturedArticleId] = useState<string>(
    (settings.featured_article_id as string) || "none"
  );
  const [instagramUrl, setInstagramUrl] = useState<string>(
    (settings.instagram_url as string) || ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await saveHomeSettings({
      featuredArticleId,
      instagramUrl,
    });

    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-cream-dark/30 -mx-6 -mt-6 px-6 py-4 backdrop-blur-sm border-b border-branch/5">
        <h1 className={`text-xl font-bold text-navy ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
          {isHebrew ? "הגדרות עמוד הבית" : "Home Page Settings"}
        </h1>
        <Button type="submit" disabled={saving} variant="terracotta">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? (isHebrew ? "שומר..." : "Saving...") : (isHebrew ? "שמור" : "Save")}
        </Button>
      </div>

      {error && (
        <div className="bg-error/5 border border-error/20 rounded-lg p-3 text-sm text-error">{error}</div>
      )}
      {success && (
        <div className="bg-green/5 border border-green/20 rounded-lg p-3 text-sm text-green">
          {isHebrew ? "ההגדרות נשמרו בהצלחה!" : "Settings saved successfully!"}
        </div>
      )}

      {/* Featured Article */}
      <Card>
        <CardHeader>
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>
            {isHebrew ? "מאמר מומלץ" : "Featured Article"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="mb-1.5">
            {isHebrew ? "בחרו מאמר להציג בעמוד הבית" : "Select an article to feature on the home page"}
          </Label>
          <Select value={featuredArticleId} onValueChange={setFeaturedArticleId}>
            <SelectTrigger>
              <SelectValue placeholder={isHebrew ? "בחרו מאמר..." : "Select article..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{isHebrew ? "ללא מאמר מומלץ" : "No featured article"}</SelectItem>
              {articles.map((article) => (
                <SelectItem key={article.id} value={article.id}>
                  {isHebrew ? article.title_he : article.title_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Instagram */}
      <Card>
        <CardHeader>
          <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>
            {isHebrew ? "אינסטגרם" : "Instagram"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="mb-1.5">
            {isHebrew ? "קישור לפרופיל האינסטגרם" : "Instagram profile URL"}
          </Label>
          <Input
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            dir="ltr"
            placeholder="https://instagram.com/tikvatenu"
          />
        </CardContent>
      </Card>
    </form>
  );
}
