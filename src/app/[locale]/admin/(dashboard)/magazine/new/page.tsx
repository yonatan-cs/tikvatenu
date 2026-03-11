import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArticleForm } from "@/components/admin/article-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewArticlePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale === "he" ? "" : locale + "/"}admin/login`);

  return <ArticleForm isHebrew={locale === "he"} userId={user.id} />;
}
