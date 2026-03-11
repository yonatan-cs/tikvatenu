"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import type { RegistrationField } from "@/lib/types/database";

interface RegistrationFormProps {
  eventId: string;
  eventTitle: string;
  fields: RegistrationField[];
  isHebrew: boolean;
  isFull: boolean;
  deadlinePassed: boolean;
}

export function RegistrationForm({
  eventId,
  eventTitle,
  fields,
  isHebrew,
  isFull,
  deadlinePassed,
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
    return (
      <Card className="border-green/20 bg-green/5">
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green mx-auto mb-3" />
          <h3 className={`text-xl font-bold text-navy mb-2 ${isHebrew ? "font-['Secular_One']" : "font-[family-name:var(--font-playfair)]"}`}>
            {isHebrew ? "נרשמת בהצלחה!" : "Registration Successful!"}
          </h3>
          <p className="text-sm text-ink-muted">
            {isHebrew
              ? `נרשמת בהצלחה ל${eventTitle}. נשלח אליך אישור למייל.`
              : `You've been registered for ${eventTitle}. A confirmation email will be sent.`
            }
          </p>
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

            return (
              <div key={field.id}>
                <Label className="mb-1.5">
                  {label} {field.required && "*"}
                </Label>

                {field.type === "select" ? (
                  <Select
                    value={customFields[field.id] || ""}
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
                ) : field.type === "checkbox" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={customFields[field.id] === "true"}
                      onChange={(e) => updateCustomField(field.id, e.target.checked.toString())}
                      className="rounded border-branch/20"
                      required={field.required}
                    />
                    <span className="text-sm text-ink-light">{label}</span>
                  </div>
                ) : (
                  <Input
                    type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                    value={customFields[field.id] || ""}
                    onChange={(e) => updateCustomField(field.id, e.target.value)}
                    required={field.required}
                  />
                )}
              </div>
            );
          })}

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
