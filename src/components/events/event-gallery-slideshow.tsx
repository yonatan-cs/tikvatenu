"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryImage } from "@/lib/types/database";

interface EventGallerySlideshowProps {
  images: GalleryImage[];
  isHebrew: boolean;
}

export function EventGallerySlideshow({ images, isHebrew }: EventGallerySlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (isPaused || lightboxOpen || images.length <= 1) return;
    const timer = setInterval(goNext, 4000);
    return () => clearInterval(timer);
  }, [isPaused, lightboxOpen, goNext, images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") isHebrew ? goNext() : goPrev();
      if (e.key === "ArrowRight") isHebrew ? goPrev() : goNext();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, goNext, goPrev, isHebrew]);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];
  const caption = isHebrew ? currentImage.caption_he : currentImage.caption_en;

  return (
    <>
      {/* Slideshow */}
      <div
        className="relative rounded-2xl overflow-hidden bg-navy/5 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Main image */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="block w-full cursor-pointer"
        >
          <div className="relative aspect-[16/10] md:aspect-[16/9]">
            <Image
              src={currentImage.image_url}
              alt={caption || ""}
              fill
              className="object-cover transition-opacity duration-500"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>
        </button>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute start-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 text-navy shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 text-navy shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                  idx === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}

        {/* Counter */}
        <div className="absolute top-3 end-3 px-3 py-1 rounded-full bg-navy/60 text-white text-xs backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Caption */}
        {caption && (
          <div className="absolute bottom-10 inset-x-0 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-navy/60 text-white text-sm backdrop-blur-sm">
              {caption}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(idx)}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                idx === currentIndex
                  ? "ring-2 ring-terracotta opacity-100"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img.image_url}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-navy/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 end-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute start-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute end-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-5xl max-h-[85vh] w-full mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage.image_url}
              alt={caption || ""}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[85vh] object-contain"
              priority
            />
            {caption && (
              <p className="text-center text-white/80 text-sm mt-3">{caption}</p>
            )}
            <p className="text-center text-white/40 text-xs mt-1">
              {currentIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
