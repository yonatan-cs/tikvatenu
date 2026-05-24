export function normalizeIsraeliPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");

  if (digits.startsWith("972") && digits.length === 12) return digits;
  if (digits.length === 10 && digits.startsWith("05")) return "972" + digits.slice(1);
  if (digits.length === 9 && digits.startsWith("5")) return "972" + digits;
  return null;
}

export function formatE164(e164: string): string {
  return "+" + e164;
}
