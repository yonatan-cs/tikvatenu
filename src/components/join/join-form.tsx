"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function JoinForm({ isHebrew }: { isHebrew: boolean }) {
  const t = useTranslations("join.form");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayFont = isHebrew
    ? "font-['Secular_One']"
    : "font-[family-name:var(--font-playfair)]";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.get("full_name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          interests: formData.get("interests"),
          how_heard: formData.get("how_heard"),
          message: formData.get("message"),
        }),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        try {
          const data = await res.json();
          setErrorMessage(data.error || null);
        } catch {
          setErrorMessage(null);
        }
        if (res.status >= 500) {
          console.error("Join form submission failed with status", res.status);
        }
        setStatus("error");
      }
    } catch (err) {
      console.error("Join form submission error", err);
      setErrorMessage(null);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-branch/5">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p className="text-lg font-medium text-navy">{t("success")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-branch/5">
      <h2 className={`text-xl font-bold text-navy mb-2 ${displayFont}`}>
        {t("title")}
      </h2>
      <p className="text-ink-muted text-sm mb-6">{t("description")}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="join-name" className="block text-sm font-medium text-navy mb-1.5">
            {t("name")} *
          </label>
          <input
            id="join-name"
            name="full_name"
            type="text"
            required
            className="w-full rounded-lg border border-branch/20 bg-cream/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-branch focus:ring-1 focus:ring-branch outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="join-email" className="block text-sm font-medium text-navy mb-1.5">
            {t("email")} *
          </label>
          <input
            id="join-email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-branch/20 bg-cream/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-branch focus:ring-1 focus:ring-branch outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="join-phone" className="block text-sm font-medium text-navy mb-1.5">
            {t("phone")}
          </label>
          <input
            id="join-phone"
            name="phone"
            type="tel"
            className="w-full rounded-lg border border-branch/20 bg-cream/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-branch focus:ring-1 focus:ring-branch outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="join-interests" className="block text-sm font-medium text-navy mb-1.5">
            {t("interests")}
          </label>
          <input
            id="join-interests"
            name="interests"
            type="text"
            placeholder={t("interestsPlaceholder")}
            className="w-full rounded-lg border border-branch/20 bg-cream/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-branch focus:ring-1 focus:ring-branch outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="join-how-heard" className="block text-sm font-medium text-navy mb-1.5">
            {t("howHeard")}
          </label>
          <input
            id="join-how-heard"
            name="how_heard"
            type="text"
            placeholder={t("howHeardPlaceholder")}
            className="w-full rounded-lg border border-branch/20 bg-cream/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-branch focus:ring-1 focus:ring-branch outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="join-message" className="block text-sm font-medium text-navy mb-1.5">
            {t("message")}
          </label>
          <textarea
            id="join-message"
            name="message"
            rows={3}
            placeholder={t("messagePlaceholder")}
            className="w-full rounded-lg border border-branch/20 bg-cream/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-branch focus:ring-1 focus:ring-branch outline-none transition-colors resize-none"
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-error">{errorMessage || t("error")}</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-lg bg-terracotta text-white font-semibold py-3 text-sm hover:bg-terracotta-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? t("submitting") : t("submit")}
        </button>
      </form>
    </div>
  );
}
