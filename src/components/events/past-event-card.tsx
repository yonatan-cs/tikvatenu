import { Link } from "@/i18n/navigation";
import { Calendar, MapPin, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Event, GalleryImage } from "@/lib/types/database";
import Image from "next/image";

interface PastEventCardProps {
  event: Event;
  isHebrew: boolean;
  galleryImages?: GalleryImage[];
}

export function PastEventCard({ event, isHebrew, galleryImages = [] }: PastEventCardProps) {
  const title = isHebrew ? event.title_he : event.title_en;
  const summary = isHebrew ? event.summary_he : event.summary_en;
  const location = isHebrew ? event.location_he : event.location_en;
  const eventDate = new Date(event.event_date);
  const displayFont = isHebrew
    ? "font-['Secular_One']"
    : "font-[family-name:var(--font-playfair)]";
  const previewImages = galleryImages.slice(0, 4);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block card-organic overflow-hidden hover:shadow-md transition-all duration-300"
    >
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-sky-light/20 via-branch/[0.06] to-terracotta/[0.04]">
        {event.cover_image ? (
          <>
            <Image
              src={event.cover_image}
              alt={title}
              fill
              className="object-cover group-hover:scale-[1.04] transition-transform duration-600"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-branch/12" />
          </div>
        )}

        {/* Date badge overlay */}
        <div className="absolute top-3 start-3 bg-white/92 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-white/20">
          <p className="text-[10px] text-navy/50 font-medium uppercase tracking-wider text-center">
            {eventDate.toLocaleDateString(isHebrew ? "he-IL" : "en-US", { month: "short" })}
          </p>
          <p className="text-xl font-bold text-navy leading-tight text-center">
            {eventDate.getDate()}
          </p>
          <p className="text-[10px] text-navy/40 font-medium text-center">
            {String(eventDate.getFullYear()).slice(-2)}
          </p>
        </div>

        <div className="absolute top-3 end-3">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs">
            {isHebrew ? "הסתיים" : "Past"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className={`text-lg font-bold text-navy mb-2 group-hover:text-branch transition-colors duration-300 leading-snug ${displayFont}`}>
          {title}
        </h3>

        {/* Event meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted/80 mb-3">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-branch/50" />
            {eventDate.toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          {location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-branch/50" />
              {location}
            </span>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <p className="text-sm text-ink-muted line-clamp-3 mb-4 leading-relaxed whitespace-pre-line">
            {summary}
          </p>
        )}

        {/* Gallery thumbnail strip */}
        {previewImages.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-branch/10">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {previewImages.map((img, i) => (
                <div
                  key={img.id}
                  className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm"
                  style={{ zIndex: previewImages.length - i }}
                >
                  <Image
                    src={img.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ))}
            </div>
            <span className="text-xs text-ink-muted/60 flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {galleryImages.length} {isHebrew ? "תמונות" : "photos"}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
