"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { normalizeIsraeliPhone, formatE164 } from "@/lib/utils/phone";
import { markFeedbackWaSent } from "@/lib/actions/admin";
import { COMMUNITY_FOOTER_HE } from "@/lib/constants/community";
import type { EventRegistration } from "@/lib/types/database";

interface WhatsAppKitProps {
  eventId: string;
  eventTitle: string;
  feedbackUrl: string;
  customIntro: string | null;
  registrations: EventRegistration[];
  isHebrew: boolean;
}

interface Recipient {
  reg: EventRegistration;
  e164: string;
}

function buildMessage(name: string, eventTitle: string, customIntro: string | null, url: string): string {
  const intro = customIntro && customIntro.trim() ? `${customIntro.trim()}\n\n` : "";
  return `היי ${name},
תודה שהשתתפת ב-${eventTitle}!

${intro}נשמח לקבל את המשוב שלך:
${url}
${COMMUNITY_FOOTER_HE}`;
}

export function WhatsAppKit({
  eventId: _eventId,
  eventTitle,
  feedbackUrl,
  customIntro,
  registrations,
  isHebrew,
}: WhatsAppKitProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const { eligible, withoutPhone, alreadyMarked } = useMemo(() => {
    const eligible: Recipient[] = [];
    const withoutPhone: EventRegistration[] = [];
    const alreadyMarked: Recipient[] = [];

    for (const reg of registrations) {
      if (reg.status === "cancelled") continue;
      const e164 = normalizeIsraeliPhone(reg.phone);
      if (!e164) {
        withoutPhone.push(reg);
        continue;
      }
      const rcpt = { reg, e164 };
      if (reg.feedback_wa_marked_at) alreadyMarked.push(rcpt);
      else eligible.push(rcpt);
    }
    return { eligible, withoutPhone, alreadyMarked };
  }, [registrations]);

  async function sendOne(rcpt: Recipient) {
    const msg = buildMessage(rcpt.reg.full_name, eventTitle, customIntro, feedbackUrl);
    const url = `https://wa.me/${rcpt.e164}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSendingId(rcpt.reg.id);
    try {
      const res = await markFeedbackWaSent([rcpt.reg.id]);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      router.refresh();
    } finally {
      setSendingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-start cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green" />
            <CardTitle className={isHebrew ? "font-['Secular_One']" : ""}>
              {isHebrew ? "שליחה בוואצאפ" : "Send via WhatsApp"}
            </CardTitle>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-ink-muted" /> : <ChevronDown className="w-5 h-5 text-ink-muted" />}
        </button>
        <p className="text-xs text-ink-muted mt-2">
          {isHebrew
            ? `${eligible.length} ממתינים · ${alreadyMarked.length} סומנו · ${withoutPhone.length} ללא טלפון תקין`
            : `${eligible.length} pending · ${alreadyMarked.length} marked · ${withoutPhone.length} no valid phone`}
        </p>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-6">
          {(eligible.length > 0 || alreadyMarked.length > 0) && (
            <div>
              <p className="text-sm font-semibold text-navy mb-2">
                {isHebrew ? "שליחה אחד-אחד" : "Send one-by-one"}
              </p>
              <p className="text-xs text-ink-muted mb-3">
                {isHebrew
                  ? "לחיצה על 'פתח' פותחת את הוואצאפ שלכם עם ההודעה ממולאת. לחצו שלח בטלפון/בדפדפן."
                  : "Opens your WhatsApp with the message pre-filled. Press send manually."}
              </p>
              <div className="rounded-lg border border-branch/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-cream/40 text-xs text-ink-muted">
                    <tr>
                      <th className="text-start px-3 py-2 font-medium">{isHebrew ? "שם" : "Name"}</th>
                      <th className="text-start px-3 py-2 font-medium">{isHebrew ? "טלפון" : "Phone"}</th>
                      <th className="text-start px-3 py-2 font-medium">{isHebrew ? "סטטוס" : "Status"}</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-branch/5">
                    {[...eligible, ...alreadyMarked].map((rcpt) => (
                      <tr key={rcpt.reg.id} className="hover:bg-cream/20">
                        <td className="px-3 py-2 text-navy">{rcpt.reg.full_name}</td>
                        <td className="px-3 py-2 text-ink-light" dir="ltr">{formatE164(rcpt.e164)}</td>
                        <td className="px-3 py-2 text-xs">
                          {rcpt.reg.feedback_wa_marked_at ? (
                            <span className="text-green">✓ {isHebrew ? "נשלח" : "sent"}</span>
                          ) : (
                            <span className="text-ink-muted">{isHebrew ? "ממתין" : "pending"}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={sendingId === rcpt.reg.id}
                            onClick={() => sendOne(rcpt)}
                          >
                            <MessageCircle className="w-4 h-4" />
                            {isHebrew ? "פתח" : "Open"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {withoutPhone.length > 0 && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <div className="text-xs text-ink-light">
                  <p className="font-medium mb-1">
                    {isHebrew
                      ? `${withoutPhone.length} משתתפים ללא טלפון תקין:`
                      : `${withoutPhone.length} participants without valid phone:`}
                  </p>
                  <p>{withoutPhone.map((r) => r.full_name).join(", ")}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
