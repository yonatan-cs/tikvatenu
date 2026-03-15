"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/lib/types/database";

type Props = {
  photos: GalleryImage[];
  isHebrew: boolean;
};

export function RandomPhotoGrid({ photos, isHebrew }: Props) {
  const [displayed, setDisplayed] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const shuffled = [...photos].sort(() => Math.random() - 0.5);
    setDisplayed(shuffled.slice(0, 6));
  }, [photos]);

  // Render nothing until client-side shuffle runs (avoids hydration mismatch)
  if (displayed.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
      {displayed.map((photo) => (
        <div
          key={photo.id}
          className="relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-sm"
        >
          <Image
            src={photo.image_url}
            alt={isHebrew ? (photo.caption_he || "") : (photo.caption_en || "")}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        </div>
      ))}
    </div>
  );
}
