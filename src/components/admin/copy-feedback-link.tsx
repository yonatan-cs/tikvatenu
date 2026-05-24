"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check } from "lucide-react";
import { toast } from "sonner";

interface CopyFeedbackLinkProps {
  slug: string;
  locale: string;
  isHebrew: boolean;
}

export function CopyFeedbackLink({ slug, locale, isHebrew }: CopyFeedbackLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const prefix = locale === "he" ? "" : `/${locale}`;
    const url = `${window.location.origin}${prefix}/events/${slug}/feedback`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(isHebrew ? "הקישור הועתק" : "Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(isHebrew ? "שגיאה בהעתקה" : "Failed to copy");
    }
  }

  return (
    <Button onClick={handleCopy} variant="outline" size="sm">
      {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      {isHebrew ? "העתק קישור משוב" : "Copy feedback link"}
    </Button>
  );
}
