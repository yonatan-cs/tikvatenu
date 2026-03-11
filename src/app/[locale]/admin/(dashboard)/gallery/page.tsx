import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ImageIcon, Pencil } from "lucide-react";
import type { GalleryAlbum } from "@/lib/types/database";
import Image from "next/image";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminGalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  const supabase = await createClient();
  const { data: albums } = await supabase
    .from("gallery_albums")
    .select("*, gallery_images(count)")
    .order("created_at", { ascending: false });

  const typedAlbums = (albums || []) as (GalleryAlbum & { gallery_images: { count: number }[] })[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-2xl font-bold text-navy ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
          {isHebrew ? "גלריה" : "Gallery"}
        </h1>
        <Button asChild variant="terracotta">
          <Link href="/admin/gallery/new">
            <Plus className="w-4 h-4" />
            {isHebrew ? "אלבום חדש" : "New Album"}
          </Link>
        </Button>
      </div>

      {typedAlbums.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy/5 flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-navy/30" />
          </div>
          <p className="text-ink-muted mb-4">{isHebrew ? "אין אלבומים עדיין" : "No albums yet"}</p>
          <Button asChild variant="outline">
            <Link href="/admin/gallery/new">
              <Plus className="w-4 h-4" />
              {isHebrew ? "צרו את האלבום הראשון" : "Create your first album"}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {typedAlbums.map((album) => {
            const imageCount = album.gallery_images?.[0]?.count || 0;
            return (
              <div
                key={album.id}
                className="bg-white rounded-xl border border-branch/5 overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="relative h-40 bg-gradient-to-br from-sky-light/30 to-branch/10">
                  {album.cover_image ? (
                    <Image src={album.cover_image} alt="" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-branch/20" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-navy truncate">
                      {isHebrew ? album.title_he : album.title_en}
                    </h3>
                    {!album.is_published && (
                      <Badge variant="outline">{isHebrew ? "טיוטה" : "Draft"}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted mb-3">
                    {imageCount} {isHebrew ? "תמונות" : "photos"}
                  </p>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/gallery/${album.id}`}>
                      <Pencil className="w-3.5 h-3.5" />
                      {isHebrew ? "עריכה" : "Edit"}
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
