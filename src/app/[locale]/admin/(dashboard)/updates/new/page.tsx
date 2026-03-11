import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UpdateForm } from "@/components/admin/update-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewUpdatePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale === "he" ? "" : locale + "/"}admin/login`);

  return <UpdateForm isHebrew={locale === "he"} userId={user.id} />;
}
