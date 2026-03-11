import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/admin/event-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewEventPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale === "he" ? "" : locale + "/"}admin/login`);

  return <EventForm isHebrew={locale === "he"} userId={user.id} />;
}
