"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const isHebrew = locale === "he";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        isHebrew ? "אימייל או סיסמה שגויים" : "Invalid email or password"
      );
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo.jpg"
            alt="תקוותנו"
            width={160}
            height={64}
            className="h-14 w-auto"
          />
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-branch/5">
          <h1
            className={`
              text-2xl font-bold text-navy mb-2 text-center
              ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}
            `}
          >
            {isHebrew ? "כניסת מנהלים" : "Admin Login"}
          </h1>
          <p className="text-sm text-ink-muted text-center mb-8">
            {isHebrew
              ? "הזינו את פרטי ההתחברות שלכם"
              : "Enter your login credentials"}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-light mb-1">
                {isHebrew ? "אימייל" : "Email"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                  w-full px-4 py-2.5 rounded-lg border border-branch/20
                  bg-cream/50 text-ink placeholder:text-ink-muted/50
                  focus:outline-none focus:ring-2 focus:ring-branch/30 focus:border-branch/30
                  transition-colors
                "
                placeholder="admin@tikvatenu.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-light mb-1">
                {isHebrew ? "סיסמה" : "Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  w-full px-4 py-2.5 rounded-lg border border-branch/20
                  bg-cream/50 text-ink placeholder:text-ink-muted/50
                  focus:outline-none focus:ring-2 focus:ring-branch/30 focus:border-branch/30
                  transition-colors
                "
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-error text-center bg-error/5 rounded-lg py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-lg bg-navy text-parchment font-medium
                hover:bg-navy-light transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading
                ? isHebrew
                  ? "מתחבר..."
                  : "Logging in..."
                : isHebrew
                  ? "כניסה"
                  : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
