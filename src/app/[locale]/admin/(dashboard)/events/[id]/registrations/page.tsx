import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Download } from "lucide-react";
import { RegistrationsTable } from "@/components/admin/registrations-table";
import type { Event, EventRegistration, RegistrationField } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function RegistrationsPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  const supabase = await createClient();

  // Fetch event
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const typedEvent = event as Event;

  // Fetch registrations
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  const typedRegistrations = (registrations || []) as EventRegistration[];
  const confirmedCount = typedRegistrations.filter((r) => r.status === "confirmed").length;
  const waitlistCount = typedRegistrations.filter((r) => r.status === "waitlist").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ms-2">
            <Link href="/admin/events">
              <ArrowRight className={`w-4 h-4 ${isHebrew ? "" : "rotate-180"}`} />
              {isHebrew ? "חזרה לאירועים" : "Back to Events"}
            </Link>
          </Button>
          <h1
            className={`text-2xl font-bold text-navy ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}
          >
            {isHebrew ? "נרשמים" : "Registrations"}: {isHebrew ? typedEvent.title_he : typedEvent.title_en}
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-branch/5">
          <p className="text-sm text-ink-muted">{isHebrew ? "סה\"כ נרשמים" : "Total"}</p>
          <p className="text-2xl font-bold text-navy">{typedRegistrations.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-branch/5">
          <p className="text-sm text-ink-muted">{isHebrew ? "מאושרים" : "Confirmed"}</p>
          <p className="text-2xl font-bold text-green">{confirmedCount}</p>
          {typedEvent.max_participants && (
            <p className="text-xs text-ink-muted mt-1">
              {isHebrew ? `מתוך ${typedEvent.max_participants}` : `of ${typedEvent.max_participants}`}
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl p-4 border border-branch/5">
          <p className="text-sm text-ink-muted">{isHebrew ? "רשימת המתנה" : "Waitlist"}</p>
          <p className="text-2xl font-bold text-terracotta">{waitlistCount}</p>
        </div>
      </div>

      {/* Table */}
      <RegistrationsTable
        registrations={typedRegistrations}
        customFields={(typedEvent.registration_fields || []) as RegistrationField[]}
        eventTitle={isHebrew ? typedEvent.title_he : typedEvent.title_en}
        isHebrew={isHebrew}
      />
    </div>
  );
}
