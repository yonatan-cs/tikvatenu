import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FeedbacksView } from "@/components/admin/feedbacks-view";
import { EventAdminTabs } from "@/components/admin/event-admin-tabs";
import { CopyFeedbackLink } from "@/components/admin/copy-feedback-link";
import { SendFeedbackEmailsButton } from "@/components/admin/send-feedback-emails-button";
import { WhatsAppKit } from "@/components/admin/whatsapp-kit";
import { DEFAULT_FEEDBACK_FIELDS } from "@/lib/constants/default-feedback-fields";
import type { Event, EventFeedback, EventRegistration, RegistrationField } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function FeedbacksPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const typedEvent = event as Event;

  const { data: feedbacks } = await supabase
    .from("event_feedbacks")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  const typedFeedbacks = (feedbacks || []) as EventFeedback[];

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  const typedRegistrations = (registrations || []) as EventRegistration[];
  const unsentEmailCount = typedRegistrations.filter(
    (r) => r.email && !r.feedback_email_sent_at
  ).length;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tikvatenu.com").replace(/\/$/, "");
  const feedbackUrl = `${siteUrl}/he/events/${typedEvent.slug}/feedback`;
  const customIntro = isHebrew ? typedEvent.feedback_intro_he : (typedEvent.feedback_intro_en || typedEvent.feedback_intro_he);
  const eventTitleForMsg = isHebrew ? typedEvent.title_he : typedEvent.title_en;

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
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
            {isHebrew ? "משובים" : "Feedbacks"}: {isHebrew ? typedEvent.title_he : typedEvent.title_en}
          </h1>
        </div>
      </div>

      <EventAdminTabs eventId={typedEvent.id} isHebrew={isHebrew} />

      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-ink-muted">{isHebrew ? "סה\"כ משובים:" : "Total Feedbacks:"}</span>
          <span className="font-bold text-navy">{typedFeedbacks.length}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CopyFeedbackLink slug={typedEvent.slug} locale={locale} isHebrew={isHebrew} />
          <SendFeedbackEmailsButton
            eventId={typedEvent.id}
            unsentCount={unsentEmailCount}
            isHebrew={isHebrew}
          />
        </div>
      </div>

      <div className="mb-6">
        <WhatsAppKit
          eventId={typedEvent.id}
          eventTitle={eventTitleForMsg}
          feedbackUrl={feedbackUrl}
          customIntro={customIntro}
          registrations={typedRegistrations}
          isHebrew={isHebrew}
        />
      </div>

      <FeedbacksView
        feedbacks={typedFeedbacks}
        feedbackFields={
          (typedEvent.feedback_fields && typedEvent.feedback_fields.length > 0
            ? typedEvent.feedback_fields
            : DEFAULT_FEEDBACK_FIELDS) as RegistrationField[]
        }
        eventTitle={isHebrew ? typedEvent.title_he : typedEvent.title_en}
        isHebrew={isHebrew}
      />
    </div>
  );
}
