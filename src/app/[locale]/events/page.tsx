import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/events/event-card";
import { Calendar } from "lucide-react";
import type { Event } from "@/lib/types/database";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return {
    title: t("title"),
  };
}

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");
  const isHebrew = locale === "he";

  const supabase = await createClient();

  const now = new Date().toISOString();

  // Fetch upcoming events
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .gte("event_date", now)
    .order("event_date", { ascending: true });

  // Fetch past events
  const { data: pastEvents } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .lt("event_date", now)
    .order("event_date", { ascending: false })
    .limit(12);

  // Fetch registration counts for all events
  const allEvents = [...(upcomingEvents || []), ...(pastEvents || [])] as Event[];
  const eventIds = allEvents.map((e) => e.id);

  let regCounts: Record<string, number> = {};
  if (eventIds.length > 0) {
    const { data: counts } = await supabase
      .from("event_registrations")
      .select("event_id")
      .in("event_id", eventIds)
      .eq("status", "confirmed");

    if (counts) {
      regCounts = counts.reduce<Record<string, number>>((acc, r) => {
        acc[r.event_id] = (acc[r.event_id] || 0) + 1;
        return acc;
      }, {});
    }
  }

  const displayFont = isHebrew
    ? "font-['Secular_One']"
    : "font-[family-name:var(--font-playfair)]";

  return (
    <div>
      {/* Page header */}
      <div className="relative overflow-hidden hero-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-2xl">
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-navy mb-4 ${displayFont}`}>
              {t("title")}
            </h1>
            <p className="text-lg text-ink-muted leading-relaxed">
              {isHebrew
                ? "הצטרפו לאירועים שלנו - מפגשי דיאלוג, סדנאות והרצאות שבונים גשרים בחברה הישראלית."
                : "Join our events - dialogue encounters, workshops, and lectures building bridges in Israeli society."
              }
            </p>
            <div className="mt-4 h-[2px] w-12 rounded-full bg-terracotta/50" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        {/* Upcoming Events */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            <h2 className={`text-xl md:text-2xl font-bold text-navy ${displayFont}`}>
              {t("upcoming")}
            </h2>
          </div>

          {(upcomingEvents || []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {(upcomingEvents as Event[]).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isHebrew={isHebrew}
                  registrationCount={regCounts[event.id]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 card-organic">
              <Calendar className="w-12 h-12 text-branch/15 mx-auto mb-4" />
              <p className="text-ink-muted">
                {isHebrew ? "אין אירועים קרובים כרגע. עקבו אחרינו לעדכונים!" : "No upcoming events right now. Follow us for updates!"}
              </p>
            </div>
          )}
        </section>

        {/* Past Events */}
        {(pastEvents || []).length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-ink-muted/40" />
              <h2 className={`text-xl md:text-2xl font-bold text-navy/70 ${displayFont}`}>
                {t("past")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {(pastEvents as Event[]).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isHebrew={isHebrew}
                  registrationCount={regCounts[event.id]}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
