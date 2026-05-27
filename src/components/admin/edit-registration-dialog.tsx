"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { updateRegistration } from "@/lib/actions/admin";
import type { EventRegistration } from "@/lib/types/database";

interface Props {
  registration: EventRegistration;
  isHebrew: boolean;
  onUpdated?: (next: { fullName: string; phone: string | null; email: string }) => void;
}

const SYNTHETIC_EMAIL_SUFFIX = "@noemail.tikvatenu.local";

function displayEmail(email: string): string {
  return email.endsWith(SYNTHETIC_EMAIL_SUFFIX) ? "" : email;
}

export function EditRegistrationDialog({ registration, isHebrew, onUpdated }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(registration.full_name);
  const [phone, setPhone] = useState(registration.phone || "");
  const [email, setEmail] = useState(displayEmail(registration.email));
  const [saving, setSaving] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) {
      setFullName(registration.full_name);
      setPhone(registration.phone || "");
      setEmail(displayEmail(registration.email));
    }
    setOpen(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateRegistration({ id: registration.id, fullName, phone, email });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(isHebrew ? "הרשומה עודכנה" : "Registration updated");
      onUpdated?.({
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        email: email.trim() || registration.email,
      });
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => handleOpenChange(true)}
        aria-label={isHebrew ? "ערוך" : "Edit"}
      >
        <Pencil className="w-4 h-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={isHebrew ? "font-['Secular_One']" : ""}>
            {isHebrew ? "עריכת נרשם" : "Edit registration"}
          </DialogTitle>
          <DialogDescription>
            {isHebrew
              ? "תיקון פרטים שהוזנו בטעות. שם חובה, טלפון ומייל אופציונליים."
              : "Fix details entered by mistake. Name required, phone and email optional."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5">{isHebrew ? "שם מלא" : "Full name"} *</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
              placeholder={isHebrew ? "השם המלא" : "Full name"}
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
          <div>
            <Label className="mb-1.5">{isHebrew ? "אימייל" : "Email"}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              placeholder="email@example.com"
            />
            <p className="text-xs text-ink-muted mt-1">
              {isHebrew
                ? "אם תשאיר ריק - לא יישלח מייל משוב."
                : "If left empty, no feedback email will be sent."}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
              {isHebrew ? "ביטול" : "Cancel"}
            </Button>
            <Button type="submit" variant="terracotta" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isHebrew ? "שמור" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
