"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendFeedbackEmailsForEvent } from "@/lib/actions/admin";
import { useRouter } from "@/i18n/navigation";

interface Props {
  eventId: string;
  unsentCount: number;
  isHebrew: boolean;
}

export function SendFeedbackEmailsButton({ eventId, unsentCount, isHebrew }: Props) {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const confirmMsg = isHebrew
      ? `לשלוח קישור משוב במייל ל-${unsentCount} נרשמים? לא יישלחו מיילים כפולים למי שכבר קיבל.`
      : `Send feedback link email to ${unsentCount} registrants? Already-sent recipients will be skipped.`;
    if (!window.confirm(confirmMsg)) return;

    setSending(true);
    try {
      const res = await sendFeedbackEmailsForEvent(eventId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const r = res.result;
      const summary = isHebrew
        ? `נשלחו ${r.emailsSent} · דילגנו ${r.emailsSkipped} · ללא מייל ${r.emailsNoAddress}${r.errors.length ? ` · שגיאות ${r.errors.length}` : ""}`
        : `Sent ${r.emailsSent} · Skipped ${r.emailsSkipped} · No email ${r.emailsNoAddress}${r.errors.length ? ` · Errors ${r.errors.length}` : ""}`;
      toast.success(summary);
      if (r.errors.length > 0) {
        console.error("Feedback dispatch errors:", r.errors);
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <Button onClick={handleSend} variant="outline" size="sm" disabled={sending || unsentCount === 0}>
      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
      {isHebrew ? `שלח מייל לנרשמים (${unsentCount})` : `Email registrants (${unsentCount})`}
    </Button>
  );
}
