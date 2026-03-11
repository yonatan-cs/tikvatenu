import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Calendar, MapPin, Clock } from "lucide-react";
import type { Event } from "@/lib/types/database";

interface HeroEventProps {
  event: Event;
  isHebrew: boolean;
}

export function HeroEvent({ event, isHebrew }: HeroEventProps) {
  const title = isHebrew ? event.title_he : event.title_en;
  const description = isHebrew ? event.description_he : event.description_en;
  const location = isHebrew ? event.location_he : event.location_en;
  const eventDate = new Date(event.event_date);
  const displayFont = isHebrew
    ? "font-['Secular_One']"
    : "font-[family-name:var(--font-playfair)]";

  return (
    <section className="relative overflow-hidden grain-overlay min-h-screen flex items-center pt-20">
      {/* Background */}
      {event.cover_image ? (
        <div className="absolute inset-0">
          <Image
            src={event.cover_image}
            alt={title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/80 via-navy/70 to-navy/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(74,127,181,0.12),transparent_60%)]" />
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(74,127,181,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(200,149,108,0.1),transparent_50%)]" />
        </>
      )}

      {/* Decorative botanical elements */}
      <div className="absolute top-[5%] end-[5%] w-96 h-96 opacity-[0.04] animate-float pointer-events-none">
        <svg viewBox="0 0 400 400" fill="none" className="w-full h-full">
          <path
            d="M300 50c-20 40-60 80-120 100s-100 60-80 120c20 60 80 80 140 60s100-80 100-160c0-40-20-80-40-120z"
            stroke="currentColor"
            strokeWidth="1"
            className="text-parchment"
          />
          <path
            d="M250 100c-15 30-40 55-75 70s-60 40-45 80c15 40 55 45 95 30s70-55 65-110c-3-25-15-50-40-70z"
            stroke="currentColor"
            strokeWidth="0.7"
            className="text-parchment"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl stagger-children">
          {/* Upcoming event label */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-terracotta/15 border border-terracotta/25 text-terracotta-light text-sm font-medium mb-7">
            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            {isHebrew ? "האירוע הקרוב" : "Upcoming Event"}
          </div>

          {/* Event title */}
          <h1 className={`text-3xl md:text-5xl lg:text-[3.5rem] font-bold text-parchment leading-[1.15] tracking-tight mb-5 ${displayFont}`}>
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-parchment/60 max-w-2xl leading-relaxed mb-7">
            {description}
          </p>

          {/* Event info pills */}
          <div className="flex flex-wrap gap-3 mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-parchment/[0.06] border border-parchment/[0.08] text-parchment/75 text-sm">
              <Calendar className="w-4 h-4 text-sky-light/70" />
              {eventDate.toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-parchment/[0.06] border border-parchment/[0.08] text-parchment/75 text-sm">
              <Clock className="w-4 h-4 text-sky-light/70" />
              {eventDate.toLocaleTimeString(isHebrew ? "he-IL" : "en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            {location && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-parchment/[0.06] border border-parchment/[0.08] text-parchment/75 text-sm">
                <MapPin className="w-4 h-4 text-sky-light/70" />
                {location}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/events/${event.slug}`}
              className="btn-shine inline-flex items-center px-8 py-3.5 rounded-full bg-terracotta text-white font-semibold text-base hover:bg-terracotta-dark transition-all duration-300 shadow-lg shadow-terracotta/25 hover:shadow-terracotta/35 hover:-translate-y-0.5"
            >
              {isHebrew ? "לפרטים והרשמה" : "Details & Register"}
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center px-8 py-3.5 rounded-full border border-parchment/20 text-parchment/80 font-semibold text-base hover:bg-parchment/[0.06] hover:border-parchment/35 hover:text-parchment transition-all duration-300 hover:-translate-y-0.5"
            >
              {isHebrew ? "כל האירועים" : "All Events"}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="wave-bottom">
        <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="text-cream">
          <path d="M0 80L60 72C120 64 240 48 360 40C480 32 600 32 720 36C840 40 960 48 1080 52C1200 56 1320 56 1380 56L1440 56V80H0Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
