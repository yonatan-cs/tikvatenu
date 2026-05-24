import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { FeedbackForm } from "@/components/events/feedback-form";
import { DEFAULT_FEEDBACK_FIELDS } from "@/lib/constants/default-feedback-fields";
import { loc } from "@/lib/utils/loc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, AlertCircle } from "lucide-react";
import type { Event, RegistrationField } from "@/lib/types/database";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("title_he, title_en")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!event) return {};
  const isHeLocale = locale === "he";
  const title = loc(event.title_he, event.title_en, isHeLocale);
  return {
    title: isHeLocale ? `משוב: ${title}` : `Feedback: ${title}`,
    robots: { index: false, follow: false },
  };
}

export default async function FeedbackPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, slug, title_he, title_en, event_date, feedback_fields, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!event) notFound();

  const typedEvent = event as Pick<Event, "id" | "slug" | "title_he" | "title_en" | "event_date" | "feedback_fields" | "is_published">;
  const title = loc(typedEvent.title_he, typedEvent.title_en, isHebrew);
  const isPast = new Date(typedEvent.event_date) < new Date();

  return (
    <div className="min-h-screen bg-cream-dark/20 py-8 md:py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/events/${typedEvent.slug}`}>
              <ArrowRight className={`w-4 h-4 ${isHebrew ? "" : "rotate-180"}`} />
              {isHebrew ? "חזרה לעמוד האירוע" : "Back to event"}
            </Link>
          </Button>
        </div>

        {!isPast ? (
          <Card className="border-terracotta/20 bg-terracotta/5">
            <CardContent className="py-10 text-center">
              <AlertCircle className="w-10 h-10 text-terracotta/60 mx-auto mb-3" />
              <h1 className={`text-xl font-bold text-navy mb-2 ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
                {isHebrew ? "טופס המשוב עוד לא פתוח" : "Feedback form not open yet"}
              </h1>
              <p className="text-sm text-ink-muted">
                {isHebrew
                  ? "טופס המשוב ייפתח לאחר שהאירוע יסתיים."
                  : "Feedback will open after the event ends."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <FeedbackForm
            eventId={typedEvent.id}
            eventTitle={title}
            fields={
              (typedEvent.feedback_fields && typedEvent.feedback_fields.length > 0
                ? typedEvent.feedback_fields
                : DEFAULT_FEEDBACK_FIELDS) as RegistrationField[]
            }
            isHebrew={isHebrew}
            startOpen
          />
        )}
      </div>
    </div>
  );
}
