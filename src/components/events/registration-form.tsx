"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, AlertCircle, CalendarPlus, CreditCard } from "lucide-react";
import type { RegistrationField } from "@/lib/types/database";

interface RegistrationFormProps {
  eventId: string;
  eventTitle: string;
  fields: RegistrationField[];
  isHebrew: boolean;
  isFull: boolean;
  deadlinePassed: boolean;
  eventDate: string;
  eventEndDate?: string | null;
  eventLocation?: string | null;
  eventDescription?: string | null;
  paymentLink?: string | null;
}

function toCalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function buildGoogleUrl(title: string, start: Date, end: Date, location?: string | null, description?: string | null): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toCalDate(start)}/${toCalDate(end)}`,
    ...(location ? { location } : {}),
    ...(description ? { details: description } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}


export function RegistrationForm({
  eventId,
  eventTitle,
  fields,
  isHebrew,
  isFull,
  deadlinePassed,
  eventDate,
  eventEndDate,
  eventLocation,
  eventDescription,
  paymentLink,
}: RegistrationFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateCustomField(fieldId: string, value: string) {
    setCustomFields((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          full_name: fullName,
          email,
          phone: phone || null,
          custom_fields: customFields,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || (isHebrew ? "שגיאה בהרשמה" : "Registration failed"));
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError(isHebrew ? "שגיאה בהרשמה" : "Registration failed");
    }
    setSubmitting(false);
  }

  if (deadlinePassed) {
    return (
      <Card className="border-terracotta/20 bg-terracotta/5">
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-10 h-10 text-terracotta/60 mx-auto mb-3" />
          <p className="text-terracotta font-medium">
            {isHebrew ? "ההרשמה לאירוע זה נסגרה" : "Registration for this event has closed"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isFull) {
    return (
      <Card className="border-navy/10 bg-navy/5">
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-10 h-10 text-navy/40 mx-auto mb-3" />
          <p className="text-navy font-medium">
            {isHebrew ? "האירוע מלא" : "This event is full"}
          </p>
          <p className="text-sm text-ink-muted mt-1">
            {isHebrew ? "ניתן להירשם לרשימת המתנה" : "You can register for the waitlist"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    const start = new Date(eventDate);
    const end = eventEndDate ? new Date(eventEndDate) : new Date(start.getTime() + 60 * 60 * 1000);
    const googleUrl = buildGoogleUrl(eventTitle, start, end, eventLocation, eventDescription);

    return (
      <Card className="border-green/20 bg-green/5">
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green mx-auto mb-3" />
          <h3 className={`text-xl font-bold text-navy mb-2 ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
            {isHebrew ? "נרשמת בהצלחה!" : "Registration Successful!"}
          </h3>
          <p className="text-sm text-ink-muted mb-6">
            {isHebrew
              ? `נרשמת בהצלחה ל${eventTitle}. נשלח אליך אישור למייל.`
              : `You've been registered for ${eventTitle}. A confirmation email will be sent.`
            }
          </p>
          <div className="space-y-2">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-3">
              {isHebrew ? "הוסיפו ליומן" : "Add to Calendar"}
            </p>
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-branch/20 bg-white px-4 py-2.5 text-sm font-medium text-navy hover:bg-navy/5 transition-colors"
            >
              <CalendarPlus className="w-4 h-4" />
              Google Calendar
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}>
          {isHebrew ? "הרשמה לאירוע" : "Register for Event"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Default fields */}
          <div>
            <Label className="mb-1.5">{isHebrew ? "שם מלא" : "Full Name"} *</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder={isHebrew ? "השם המלא שלך" : "Your full name"}
            />
          </div>
          <div>
            <Label className="mb-1.5">{isHebrew ? "אימייל" : "Email"} *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <Label className="mb-1.5">{isHebrew ? "טלפון" : "Phone"}</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              placeholder="050-1234567"
            />
          </div>

          {/* Custom fields from JSONB */}
          {fields.map((field) => {
            const label = isHebrew ? field.label_he : field.label_en;
            const selectedValue = customFields[field.id] || "";
            const isOtherSelected = selectedValue === "אחר";

            if (field.type === "checkbox") {
              return (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`field-${field.id}`}
                    checked={selectedValue === "true"}
                    onChange={(e) => updateCustomField(field.id, e.target.checked.toString())}
                    className="rounded border-branch/20"
                    required={field.required}
                  />
                  <label htmlFor={`field-${field.id}`} className="text-sm text-ink-light cursor-pointer">
                    {label} {field.required && <span className="text-terracotta">*</span>}
                  </label>
                </div>
              );
            }

            return (
              <div key={field.id}>
                <Label className="mb-1.5">
                  {label} {field.required && "*"}
                </Label>

                {field.type === "select" ? (
                  <>
                    <Select
                      value={selectedValue}
                      onValueChange={(val) => updateCustomField(field.id, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isHebrew ? "בחרו אפשרות" : "Select option"} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isOtherSelected && (
                      <Input
                        className="mt-2"
                        placeholder={isHebrew ? "פרטו כאן..." : "Please specify..."}
                        value={customFields[`${field.id}__other`] || ""}
                        onChange={(e) => updateCustomField(`${field.id}__other`, e.target.value)}
                        required={field.required}
                      />
                    )}
                  </>
                ) : (
                  <Input
                    type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                    value={selectedValue}
                    onChange={(e) => updateCustomField(field.id, e.target.value)}
                    required={field.required}
                  />
                )}
              </div>
            );
          })}

          {paymentLink && (
            <div className="bg-branch/5 border border-branch/20 rounded-lg p-3 text-sm">
              <p className="font-medium text-navy mb-1.5">
                {isHebrew ? "תשלום" : "Payment"}
              </p>
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-terracotta hover:underline"
              >
                <CreditCard className="w-4 h-4" />
                {isHebrew ? "לחצו לתשלום בביט / PayBox" : "Pay via Bit / PayBox"}
              </a>
            </div>
          )}

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
                {isHebrew ? "נרשם..." : "Registering..."}
              </>
            ) : (
              isHebrew ? "הירשמו עכשיו" : "Register Now"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
