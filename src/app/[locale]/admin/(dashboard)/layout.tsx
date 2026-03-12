import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Toaster } from "sonner";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale === "he" ? "" : locale + "/"}admin/login`);
  }

  // Check if user has admin/editor role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "editor"].includes(profile.role)) {
    redirect(`/${locale === "he" ? "" : locale + "/"}`);
  }

  return (
    <div className="flex min-h-screen pt-4">
      <AdminSidebar locale={locale} userName={profile.full_name || user.email || "Admin"} />
      <div className="flex-1 p-6 lg:p-8 bg-cream-dark/30">
        {children}
      </div>
      <Toaster position={locale === "he" ? "bottom-left" : "bottom-right"} dir={locale === "he" ? "rtl" : "ltr"} richColors />
    </div>
  );
}
