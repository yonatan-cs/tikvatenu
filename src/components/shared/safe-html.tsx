import { sanitizeHtml } from "@/lib/utils/sanitize";

export function SafeHtml({ html, className, dir }: { html: string; className?: string; dir?: string }) {
  return <div className={className} dir={dir} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
