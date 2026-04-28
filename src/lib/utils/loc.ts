/**
 * Returns localized content with Hebrew fallback for missing English translations.
 */
export function loc(
  he: string | null | undefined,
  en: string | null | undefined,
  isHebrew: boolean
): string {
  if (isHebrew) return he ?? "";
  return en || he || "";
}
