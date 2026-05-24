"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  Copy,
  Check,
  MessageCircle,
  Send,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { normalizeIsraeliPhone, formatE164 } from "@/lib/utils/phone";
import { markFeedbackWaSent } from "@/lib/actions/admin";
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
${url}`;
}

function buildVcf(recipients: Recipient[], eventTitle: string): string {
  return recipients
    .map(({ reg, e164 }) => {
      const safeName = reg.full_name.replace(/[\r\n,;]/g, " ").trim();
      const safeEvent = eventTitle.replace(/[\r\n,;]/g, " ").trim();
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${safeName} - ${safeEvent}`,
        `N:${safeName};;;;`,
        `TEL;TYPE=CELL:${formatE164(e164)}`,
        "END:VCARD",
      ].join("\r\n");
    })
    .join("\r\n");
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
  const [messageCopied, setMessageCopied] = useState(false);
  const [marking, setMarking] = useState(false);
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

  const sampleMessage = buildMessage(
    isHebrew ? "[שם]" : "[name]",
    eventTitle,
    customIntro,
    feedbackUrl
  );

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(sampleMessage);
      setMessageCopied(true);
      toast.success(isHebrew ? "ההודעה הועתקה" : "Message copied");
      setTimeout(() => setMessageCopied(false), 2000);
    } catch {
      toast.error(isHebrew ? "שגיאה בהעתקה" : "Failed to copy");
    }
  }

  function downloadVcf() {
    if (eligible.length === 0 && alreadyMarked.length === 0) {
      toast.error(isHebrew ? "אין נמענים עם טלפון תקין" : "No recipients with valid phones");
      return;
    }
    const all = [...eligible, ...alreadyMarked];
    const vcf = buildVcf(all, eventTitle);
    const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = eventTitle.replace(/[^\w֐-׿ -]/g, "").trim().replace(/\s+/g, "-");
    link.download = `tikvatenu-${safeTitle}-contacts.vcf`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(
      isHebrew ? `הורד קובץ עם ${all.length} אנשי קשר` : `Downloaded ${all.length} contacts`
    );
  }

  async function markAllAsSent() {
    if (eligible.length === 0) return;
    const confirmMsg = isHebrew
      ? `לסמן ${eligible.length} נרשמים כאילו נשלחה להם הודעה ב-WhatsApp?`
      : `Mark ${eligible.length} registrants as WhatsApp-sent?`;
    if (!window.confirm(confirmMsg)) return;

    setMarking(true);
    try {
      const ids = eligible.map((e) => e.reg.id);
      const res = await markFeedbackWaSent(ids);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(isHebrew ? `סומנו ${res.count} נרשמים` : `Marked ${res.count}`);
      router.refresh();
    } finally {
      setMarking(false);
    }
  }

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
              {isHebrew ? "שליחה ב-WhatsApp" : "Send via WhatsApp"}
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
          <div className="bg-cream/40 border border-branch/10 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-navy">
              {isHebrew
                ? "המלצה: רשימת תפוצה ב-WhatsApp (הכי מהיר)"
                : "Recommended: WhatsApp Broadcast List (fastest)"}
            </p>
            <ol className="text-sm text-ink-light space-y-2 list-decimal ps-5 leading-relaxed">
              <li>
                {isHebrew ? "הורידו את קובץ אנשי הקשר ופתחו אותו בטלפון" : "Download contacts file and open it on your phone"}
                <div className="mt-1.5">
                  <Button onClick={downloadVcf} variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                    {isHebrew ? "הורדת אנשי קשר (vCard)" : "Download contacts (vCard)"}
                  </Button>
                </div>
              </li>
              <li>
                {isHebrew
                  ? "הוסיפו את כל אנשי הקשר לטלפון (הם יסתיימו בשם האירוע ותוכלו למחוק אותם אחר כך)"
                  : "Add all contacts to your phone (they'll have the event title suffix for easy cleanup)"}
              </li>
              <li>
                {isHebrew ? "העתיקו את הודעת המשוב" : "Copy the feedback message"}
                <div className="mt-1.5">
                  <Button onClick={copyMessage} variant="outline" size="sm">
                    {messageCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isHebrew ? "העתק הודעה" : "Copy message"}
                  </Button>
                </div>
                <pre dir={isHebrew ? "rtl" : "ltr"} className="mt-2 bg-white border border-branch/10 rounded p-3 text-xs text-ink-light whitespace-pre-wrap font-sans leading-relaxed">
                  {sampleMessage}
                </pre>
                <p className="text-xs text-ink-muted mt-1">
                  {isHebrew ? "[שם] יוחלף ידנית אם תרצו, או השאירו כללי לכל הקבוצה" : "[name] can be replaced manually or left as-is for the group"}
                </p>
              </li>
              <li>
                {isHebrew
                  ? "פתחו WhatsApp בטלפון → צ׳אטים → תפריט (3 נקודות) → \"הודעה חדשה\" → \"רשימת תפוצה חדשה\""
                  : "Open WhatsApp on your phone → Chats → menu (3 dots) → \"New broadcast\""}
              </li>
              <li>
                {isHebrew
                  ? "סמנו את כל אנשי הקשר שיובאו (חפשו לפי שם האירוע), הדביקו את ההודעה ושלחו"
                  : "Select all imported contacts (search by event title), paste the message and send"}
              </li>
              <li>
                <Button onClick={markAllAsSent} variant="terracotta" size="sm" disabled={marking || eligible.length === 0}>
                  <Send className="w-4 h-4" />
                  {isHebrew ? `סמן הכל כנשלח (${eligible.length})` : `Mark all sent (${eligible.length})`}
                </Button>
              </li>
            </ol>
          </div>

          {(eligible.length > 0 || alreadyMarked.length > 0) && (
            <div>
              <p className="text-sm font-semibold text-navy mb-2">
                {isHebrew ? "או — שליחה אחד-אחד (לפי לחיצה)" : "Or — send one-by-one (per click)"}
              </p>
              <p className="text-xs text-ink-muted mb-3">
                {isHebrew
                  ? "פותח את WhatsApp שלכם עם ההודעה כבר ממולאת. לחיצה על שלח בטלפון/בדפדפן."
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
