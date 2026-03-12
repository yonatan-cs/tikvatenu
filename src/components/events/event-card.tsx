import { Link } from "@/i18n/navigation";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/types/database";
import Image from "next/image";

interface EventCardProps {
  event: Event;
  isHebrew: boolean;
  registrationCount?: number;
}

export function EventCard({ event, isHebrew, registrationCount }: EventCardProps) {
  const title = isHebrew ? event.title_he : event.title_en;
  const description = isHebrew ? event.description_he : event.description_en;
  const location = isHebrew ? event.location_he : event.location_en;
  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const isFull = event.max_participants && registrationCount && registrationCount >= event.max_participants;
  const displayFont = isHebrew
    ? "font-['Secular_One']"
    : "font-[family-name:var(--font-playfair)]";

  return (
    <Link
      href={`/events/${event.slug}`}
      className={`group block card-organic overflow-hidden ${isPast ? "opacity-75 hover:opacity-100" : ""}`}
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
            <div className="absolute inset-0 bg-gradient-to-t from-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
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

        {/* Status badges */}
        <div className="absolute top-3 end-3 flex gap-1.5">
          {isPast && (
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs">
              {isHebrew ? "הסתיים" : "Past"}
            </Badge>
          )}
          {isFull && !isPast && (
            <Badge variant="destructive" className="bg-white/90 backdrop-blur-sm text-xs">
              {isHebrew ? "מלא" : "Full"}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className={`text-lg font-bold text-navy mb-2 group-hover:text-branch transition-colors duration-300 leading-snug ${displayFont}`}>
          {title}
        </h3>
        <p className="text-sm text-ink-muted line-clamp-2 mb-4 leading-relaxed whitespace-pre-line">{description}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted/80">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-branch/50" />
            {eventDate.toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-branch/50" />
              {location}
            </span>
          )}
          {event.max_participants && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-branch/50" />
              {registrationCount || 0}/{event.max_participants}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
