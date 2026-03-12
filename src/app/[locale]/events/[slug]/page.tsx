import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { RegistrationForm } from "@/components/events/registration-form";
import { Calendar, MapPin, Users, Clock, ArrowRight, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventGallerySlideshow } from "@/components/events/event-gallery-slideshow";
import { SafeHtml } from "@/components/shared/safe-html";
import type { Event, RegistrationField, GalleryImage } from "@/lib/types/database";
import Image from "next/image";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("title_he, title_en, description_he, description_en, cover_image")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!event) return {};

  const title = locale === "he" ? event.title_he : event.title_en;
  const description = locale === "he" ? event.description_he : event.description_en;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: event.cover_image ? [event.cover_image] : [],
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!event) notFound();

  const typedEvent = event as Event;

  // Get registration count
  const { count: regCount } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", typedEvent.id)
    .eq("status", "confirmed");

  // Fetch event gallery images (from albums linked to this event)
  const { data: eventAlbums } = await supabase
    .from("gallery_albums")
    .select("id")
    .eq("event_id", typedEvent.id)
    .eq("is_published", true);

  let galleryImages: GalleryImage[] = [];
  if (eventAlbums && eventAlbums.length > 0) {
    const albumIds = eventAlbums.map((a: { id: string }) => a.id);
    const { data: images } = await supabase
      .from("gallery_images")
      .select("*")
      .in("album_id", albumIds)
      .order("sort_order", { ascending: true });
    galleryImages = (images || []) as GalleryImage[];
  }

  const title = isHebrew ? typedEvent.title_he : typedEvent.title_en;
  const description = isHebrew ? typedEvent.description_he : typedEvent.description_en;
  const body = isHebrew ? typedEvent.body_he : typedEvent.body_en;
  const location = isHebrew ? typedEvent.location_he : typedEvent.location_en;
  const eventDate = new Date(typedEvent.event_date);
  const endDate = typedEvent.event_end_date ? new Date(typedEvent.event_end_date) : null;
  const isPast = eventDate < new Date();
  const isFull = !!(typedEvent.max_participants && regCount && regCount >= typedEvent.max_participants);
  const deadlinePassed = !!(typedEvent.registration_deadline && new Date(typedEvent.registration_deadline) < new Date());

  return (
    <div className="pt-0">
      {/* Hero with cover image - full display like a landing page */}
      <div className="relative">
        {typedEvent.cover_image ? (
          <div className="relative overflow-hidden flex justify-center bg-navy/5">
            <Image
              src={typedEvent.cover_image}
              alt={title}
              width={1200}
              height={800}
              className="w-full max-w-4xl h-auto object-contain"
              priority
            />
          </div>
        ) : (
          <div className="h-48 md:h-64 bg-gradient-to-br from-navy via-navy-light to-branch" />
        )}

        {/* Back link */}
        <div className="absolute top-2 start-2 md:top-4 md:start-4 z-10">
          <Button asChild variant="ghost" size="sm" className="bg-white/80 backdrop-blur-sm text-navy hover:bg-white/90 hover:text-navy shadow-sm text-xs md:text-sm px-2 py-1 md:px-3 md:py-2">
            <Link href="/events">
              <ArrowRight className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isHebrew ? "" : "rotate-180"}`} />
              {isHebrew ? "כל האירועים" : "All Events"}
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-branch/5 p-6 md:p-8 shadow-sm">
              {/* Title & badges */}
              <div className="flex flex-wrap items-start gap-3 mb-4">
                {isPast && (
                  <Badge variant="secondary">{isHebrew ? "הסתיים" : "Past Event"}</Badge>
                )}
                {isFull && !isPast && (
                  <Badge variant="destructive">{isHebrew ? "מלא" : "Full"}</Badge>
                )}
              </div>

              <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-4 ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
                {title}
              </h1>

              <p className="text-lg text-ink-light mb-6 leading-relaxed whitespace-pre-line">{description}</p>

              {/* Event info pills */}
              <div className="flex flex-wrap items-start gap-3 mb-8 pb-8 border-b border-branch/10">
                {endDate && endDate.toDateString() !== eventDate.toDateString() ? (
                  /* Multi-day event: single unified stacked block */
                  <div className="inline-flex flex-col gap-1.5 px-4 py-3 rounded-2xl bg-navy/5 text-sm text-navy">
                    <span className="text-xs font-medium text-navy/50">
                      {eventDate.getFullYear()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0 text-navy/50" />
                      <span>
                        {eventDate.toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
                          day: "numeric",
                          month: "long",
                        })}
                        {", "}
                        {eventDate.toLocaleTimeString(isHebrew ? "he-IL" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 shrink-0 text-navy/50" />
                      <span>
                        {endDate.toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
                          day: "numeric",
                          month: "long",
                        })}
                        {", "}
                        {endDate.toLocaleTimeString(isHebrew ? "he-IL" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Same-day event: date pill + time range pill */
                  <>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy/5 text-sm text-navy">
                      <Calendar className="w-4 h-4" />
                      {eventDate.toLocaleDateString(isHebrew ? "he-IL" : "en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy/5 text-sm text-navy">
                      <Clock className="w-4 h-4" />
                      {eventDate.toLocaleTimeString(isHebrew ? "he-IL" : "en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {endDate && (
                        <>
                          {" - "}
                          {endDate.toLocaleTimeString(isHebrew ? "he-IL" : "en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </>
                      )}
                    </div>
                  </>
                )}
                {location && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy/5 text-sm text-navy">
                    <MapPin className="w-4 h-4" />
                    {typedEvent.location_url ? (
                      <a
                        href={typedEvent.location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {location}
                      </a>
                    ) : (
                      location
                    )}
                  </div>
                )}
                {typedEvent.max_participants && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy/5 text-sm text-navy">
                    <Users className="w-4 h-4" />
                    {regCount || 0}/{typedEvent.max_participants} {isHebrew ? "משתתפים" : "participants"}
                  </div>
                )}
              </div>

              {/* Body content */}
              {body && (
                <SafeHtml
                  html={body}
                  className="prose max-w-none prose-headings:text-navy prose-p:text-ink prose-strong:text-navy [&_p:empty]:min-h-[1em]"
                  dir={isHebrew ? "rtl" : "ltr"}
                />
              )}

              {/* Event gallery slideshow */}
              {galleryImages.length > 0 && (
                <div className="mt-8 pt-8 border-t border-branch/10">
                  <h2 className={`text-xl font-bold text-navy mb-4 ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
                    {isHebrew ? "תמונות מהאירוע" : "Event Photos"}
                  </h2>
                  <EventGallerySlideshow images={galleryImages} isHebrew={isHebrew} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Registration */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              {!isPast ? (
                <RegistrationForm
                  eventId={typedEvent.id}
                  eventTitle={title}
                  fields={(typedEvent.registration_fields || []) as RegistrationField[]}
                  isHebrew={isHebrew}
                  isFull={isFull}
                  deadlinePassed={deadlinePassed}
                />
              ) : (
                <div className="bg-white rounded-2xl border border-branch/5 p-6 text-center">
                  <p className="text-ink-muted">
                    {isHebrew ? "האירוע הזה כבר הסתיים" : "This event has already taken place"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
