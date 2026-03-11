"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryImage } from "@/lib/types/database";

interface GalleryLightboxProps {
  images: GalleryImage[];
  isHebrew: boolean;
}

export function GalleryLightbox({ images, isHebrew }: GalleryLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const close = useCallback(() => setSelectedIndex(null), []);
  const prev = useCallback(() => {
    setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);
  const next = useCallback(() => {
    setSelectedIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") isHebrew ? next() : prev();
      if (e.key === "ArrowRight") isHebrew ? prev() : next();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, close, prev, next, isHebrew]);

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setSelectedIndex(idx)}
            className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
          >
            <Image
              src={img.image_url}
              alt={isHebrew ? img.caption_he || "" : img.caption_en || ""}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-navy/95 flex items-center justify-center"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 end-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute start-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute end-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.image_url}
              alt={isHebrew ? selectedImage.caption_he || "" : selectedImage.caption_en || ""}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[85vh] object-contain"
              priority
            />
            {(selectedImage.caption_he || selectedImage.caption_en) && (
              <p className="text-center text-white/80 text-sm mt-3">
                {isHebrew ? selectedImage.caption_he : selectedImage.caption_en}
              </p>
            )}
            <p className="text-center text-white/40 text-xs mt-1">
              {selectedIndex! + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
