import type { SupabaseClient } from "@supabase/supabase-js";
import { sendFeedbackEmail } from "./email";

interface DispatchOptions {
  eventId?: string;
  lookbackDays?: number;
}

export interface DispatchResult {
  eventsProcessed: number;
  emailsSent: number;
  emailsSkipped: number;
  emailsNoAddress: number;
  errors: string[];
}

function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://tikvatenu.com";
  return raw.replace(/\/$/, "");
}

interface EventRow {
  id: string;
  slug: string;
  title_he: string;
  title_en: string;
  event_date: string;
  feedback_intro_he: string | null;
  feedback_intro_en: string | null;
}

interface RegistrationRow {
  id: string;
  full_name: string;
  email: string | null;
  feedback_email_sent_at: string | null;
  status: string;
}

export async function dispatchFeedbackEmails(
  adminSupabase: SupabaseClient,
  options: DispatchOptions = {}
): Promise<DispatchResult> {
  const lookbackDays = options.lookbackDays ?? 7;
  const result: DispatchResult = {
    eventsProcessed: 0,
    emailsSent: 0,
    emailsSkipped: 0,
    emailsNoAddress: 0,
    errors: [],
  };

  let eventsQuery = adminSupabase
    .from("events")
    .select("id, slug, title_he, title_en, event_date, feedback_intro_he, feedback_intro_en, feedback_auto_send, is_published");

  if (options.eventId) {
    eventsQuery = eventsQuery.eq("id", options.eventId);
  } else {
    const cutoff = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();
    eventsQuery = eventsQuery
      .eq("feedback_auto_send", true)
      .lt("event_date", new Date().toISOString())
      .gte("event_date", cutoff);
  }

  const { data: events, error: eventsError } = await eventsQuery;
  if (eventsError) {
    result.errors.push(`Failed to fetch events: ${eventsError.message}`);
    return result;
  }

  const eventList = (events || []) as EventRow[];
  const siteUrl = getSiteUrl();

  for (const event of eventList) {
    result.eventsProcessed++;

    const { data: regs, error: regsError } = await adminSupabase
      .from("event_registrations")
      .select("id, full_name, email, feedback_email_sent_at, status")
      .eq("event_id", event.id)
      .neq("status", "cancelled");

    if (regsError) {
      result.errors.push(`Event ${event.id}: ${regsError.message}`);
      continue;
    }

    const registrations = (regs || []) as RegistrationRow[];
    const feedbackUrl = `${siteUrl}/he/events/${event.slug}/feedback`;
    const eventTitle = event.title_he || event.title_en;

    for (const reg of registrations) {
      if (reg.feedback_email_sent_at) {
        result.emailsSkipped++;
        continue;
      }
      if (!reg.email) {
        result.emailsNoAddress++;
        continue;
      }

      const sendResult = await sendFeedbackEmail({
        to: reg.email,
        participantName: reg.full_name,
        eventTitle,
        feedbackUrl,
        customIntro: event.feedback_intro_he,
      });

      if (sendResult.ok) {
        const { error: updateError } = await adminSupabase
          .from("event_registrations")
          .update({ feedback_email_sent_at: new Date().toISOString() })
          .eq("id", reg.id);
        if (updateError) {
          result.errors.push(`Reg ${reg.id} mark sent failed: ${updateError.message}`);
        } else {
          result.emailsSent++;
        }
      } else {
        result.errors.push(`Reg ${reg.id} (${reg.email}): ${sendResult.error}`);
      }
    }
  }

  return result;
}
