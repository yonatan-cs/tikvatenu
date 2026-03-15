"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ContactForm({ isHebrew }: { isHebrew: boolean }) {
  const t = useTranslations("join.contact");
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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          terms_accepted: formData.get("terms_accepted") === "on",
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
          console.error("Contact form submission failed with status", res.status);
        }
        setStatus("error");
      }
    } catch (err) {
      console.error("Contact form submission error", err);
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
          <label htmlFor="contact-name" className="block text-sm font-medium text-navy mb-1.5">
            {t("name")} *
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-branch/20 bg-cream/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-branch focus:ring-1 focus:ring-branch outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-navy mb-1.5">
            {t("email")} *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-branch/20 bg-cream/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-branch focus:ring-1 focus:ring-branch outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="contact-subject" className="block text-sm font-medium text-navy mb-1.5">
            {t("subject")}
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            placeholder={t("subjectPlaceholder")}
            className="w-full rounded-lg border border-branch/20 bg-cream/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-branch focus:ring-1 focus:ring-branch outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-sm font-medium text-navy mb-1.5">
            {t("message")} *
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            required
            placeholder={t("messagePlaceholder")}
            className="w-full rounded-lg border border-branch/20 bg-cream/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-branch focus:ring-1 focus:ring-branch outline-none transition-colors resize-none"
          />
        </div>

        <div className="flex items-start gap-3">
          <input
            id="contact-terms"
            name="terms_accepted"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-branch/30 text-navy focus:ring-navy accent-navy cursor-pointer"
          />
          <label htmlFor="contact-terms" className="text-xs text-ink-muted leading-relaxed cursor-pointer">
            {isHebrew ? (
              <>אני מאשר/ת את <a href="/he/terms" target="_blank" className="underline text-navy hover:text-terracotta transition-colors">תקנון האתר</a> ו<a href="/he/privacy" target="_blank" className="underline text-navy hover:text-terracotta transition-colors">מדיניות הפרטיות</a></>
            ) : (
              <>I agree to the <a href="/en/terms" target="_blank" className="underline text-navy hover:text-terracotta transition-colors">Terms of Service</a> and <a href="/en/privacy" target="_blank" className="underline text-navy hover:text-terracotta transition-colors">Privacy Policy</a></>
            )}
          </label>
        </div>

        {status === "error" && (
          <p className="text-sm text-error">{errorMessage || t("error")}</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-lg bg-navy text-parchment font-semibold py-3 text-sm hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? t("submitting") : t("submit")}
        </button>
      </form>
    </div>
  );
}
