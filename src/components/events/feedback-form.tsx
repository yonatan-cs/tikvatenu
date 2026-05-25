"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, MessageSquare, MessageCircle, Instagram } from "lucide-react";
import { DynamicFields } from "./dynamic-fields";
import { COMMUNITY_LINKS } from "@/lib/constants/community";
import type { RegistrationField } from "@/lib/types/database";

interface FeedbackFormProps {
  eventId: string;
  eventTitle: string;
  fields: RegistrationField[];
  isHebrew: boolean;
  startOpen?: boolean;
  intro?: string | null;
}

export function FeedbackForm({ eventId, eventTitle, fields, isHebrew, startOpen = false, intro }: FeedbackFormProps) {
  const [open, setOpen] = useState(startOpen);
  const [respondentName, setRespondentName] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(fieldId: string, value: string) {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          respondent_name: respondentName,
          responses,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || (isHebrew ? "שגיאה בשליחת המשוב" : "Failed to submit feedback"));
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError(isHebrew ? "שגיאה בשליחת המשוב" : "Failed to submit feedback");
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <Card className="border-green/20 bg-green/5">
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green mx-auto mb-3" />
          <h3 className={`text-xl font-bold text-navy mb-2 ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
            {isHebrew ? "תודה על המשוב!" : "Thank you for your feedback!"}
          </h3>
          <p className="text-sm text-ink-muted mb-8">
            {isHebrew
              ? "המשוב שלך עוזר לנו לגדול ולהשתפר."
              : "Your feedback helps us grow and improve."}
          </p>

          <div className="pt-6 border-t border-branch/10">
            <h4 className={`text-base font-bold text-navy mb-2 ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
              {isHebrew ? "הישארו מעודכנים!" : "Stay updated!"}
            </h4>
            <p className="text-sm text-ink-light mb-5 leading-relaxed">
              {isHebrew
                ? "הצטרפו לקבוצת הוואצאפ שלנו לעדכונים על אירועים, ועקבו אחרינו באינסטגרם 💞🤩"
                : "Join our WhatsApp group for event updates and follow us on Instagram 💞🤩"}
            </p>
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <a
                href={COMMUNITY_LINKS.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm shadow-md shadow-[#25D366]/15 hover:opacity-90 hover:-translate-y-0.5 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                {isHebrew ? "וואצאפ" : "WhatsApp"}
              </a>
              <a
                href={COMMUNITY_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-semibold text-sm shadow-md shadow-[#fd1d1d]/15 hover:opacity-90 hover:-translate-y-0.5 transition-all"
              >
                <Instagram className="w-4 h-4" />
                {isHebrew ? "אינסטגרם" : "Instagram"}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!open) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageSquare className="w-10 h-10 text-branch/60 mx-auto mb-3" />
          <h3 className={`text-lg font-bold text-navy mb-2 ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
            {isHebrew ? "השתתפת באירוע?" : "Attended this event?"}
          </h3>
          <p className="text-sm text-ink-muted mb-5">
            {isHebrew
              ? "נשמח לקבל את המשוב שלכם.ן כדי ללמוד ולהשתפר."
              : "We'd love to hear your feedback to learn and improve."}
          </p>
          <Button
            type="button"
            variant="terracotta"
            size="lg"
            onClick={() => setOpen(true)}
            className="w-full"
          >
            {isHebrew ? "השאירו משוב" : "Leave Feedback"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}>
          {isHebrew ? `משוב: ${eventTitle}` : `Feedback: ${eventTitle}`}
        </CardTitle>
        {intro && intro.trim() ? (
          <p className="text-sm text-ink-light mt-2 whitespace-pre-line leading-relaxed">
            {intro}
          </p>
        ) : (
          <p className="text-sm text-ink-muted mt-1">
            {isHebrew
              ? "תודה שהשתתפת. נשמח לקבל את המשוב שלך."
              : "Thanks for attending. We'd love to hear from you."}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5">{isHebrew ? "שמכם בישראל" : "Your name"} *</Label>
            <Input
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              required
              placeholder={isHebrew ? "השם המלא שלך" : "Your full name"}
            />
          </div>

          <DynamicFields
            fields={fields}
            values={responses}
            onChange={updateField}
            isHebrew={isHebrew}
          />

          {error && (
            <div className="bg-error/5 border border-error/20 rounded-lg p-3 text-sm text-error">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="terracotta"
            size="lg"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isHebrew ? "שולח..." : "Submitting..."}
              </>
            ) : (
              isHebrew ? "שלחו משוב" : "Submit Feedback"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
