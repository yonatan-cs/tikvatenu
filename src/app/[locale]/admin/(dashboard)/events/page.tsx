import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, ExternalLink, Pencil } from "lucide-react";
import type { Event } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminEventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  const typedEvents = (events || []) as Event[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1
          className={`text-2xl font-bold text-navy ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}
        >
          {isHebrew ? "אירועים" : "Events"}
        </h1>
        <Button asChild variant="terracotta">
          <Link href="/admin/events/new">
            <Plus className="w-4 h-4" />
            {isHebrew ? "אירוע חדש" : "New Event"}
          </Link>
        </Button>
      </div>

      {typedEvents.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy/5 flex items-center justify-center">
            <Calendar className="w-7 h-7 text-navy/30" />
          </div>
          <p className="text-ink-muted mb-4">
            {isHebrew ? "אין אירועים עדיין" : "No events yet"}
          </p>
          <Button asChild variant="outline">
            <Link href="/admin/events/new">
              <Plus className="w-4 h-4" />
              {isHebrew ? "צרו את האירוע הראשון" : "Create your first event"}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {typedEvents.map((event) => {
            const eventDate = new Date(event.event_date);
            const isPast = eventDate < new Date();
            const title = isHebrew ? event.title_he : event.title_en;

            return (
              <div
                key={event.id}
                className="flex items-center gap-4 bg-white rounded-xl border border-branch/5 p-4 hover:shadow-sm transition-shadow"
              >
                {/* Date badge */}
                <div className="shrink-0 w-14 h-14 rounded-lg bg-navy/5 flex flex-col items-center justify-center">
                  <span className="text-xs text-navy/60 font-medium">
                    {eventDate.toLocaleDateString(locale, { month: "short" })}
                  </span>
                  <span className="text-lg font-bold text-navy leading-tight">
                    {eventDate.getDate()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-navy truncate">{title}</h3>
                    {!event.is_published && (
                      <Badge variant="outline">{isHebrew ? "טיוטה" : "Draft"}</Badge>
                    )}
                    {isPast && (
                      <Badge variant="secondary">{isHebrew ? "עבר" : "Past"}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-ink-muted truncate">
                    {isHebrew ? event.description_he : event.description_en}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/events/${event.id}/registrations`}>
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">{isHebrew ? "נרשמים" : "Registrations"}</span>
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/admin/events/${event.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </Button>
                  {event.is_published && (
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/events/${event.slug}`}>
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
