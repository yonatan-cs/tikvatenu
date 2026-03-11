import { setRequestLocale } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/admin/event-form";
import type { Event } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditEventPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale === "he" ? "" : locale + "/"}admin/login`);

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  return <EventForm event={event as Event} isHebrew={locale === "he"} userId={user.id} />;
}
