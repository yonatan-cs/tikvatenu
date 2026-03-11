import { setRequestLocale } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UpdateForm } from "@/components/admin/update-form";
import type { Update } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditUpdatePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale === "he" ? "" : locale + "/"}admin/login`);

  const { data: update } = await supabase
    .from("updates")
    .select("*")
    .eq("id", id)
    .single();

  if (!update) notFound();

  return <UpdateForm update={update as Update} isHebrew={locale === "he"} userId={user.id} />;
}
