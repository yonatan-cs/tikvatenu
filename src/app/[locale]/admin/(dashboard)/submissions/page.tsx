import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SubmissionsView } from "@/components/admin/submissions-view";
import type { JoinSubmission, ContactSubmission } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SubmissionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHebrew = locale === "he";

  const supabase = await createClient();

  const { data: joinSubmissions } = await supabase
    .from("join_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: contactSubmissions } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">
        {isHebrew ? "פניות" : "Submissions"}
      </h1>

      <SubmissionsView
        joinSubmissions={(joinSubmissions || []) as JoinSubmission[]}
        contactSubmissions={(contactSubmissions || []) as ContactSubmission[]}
        isHebrew={isHebrew}
      />
    </div>
  );
}
