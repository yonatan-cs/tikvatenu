import sanitize from "sanitize-html";

export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: ["h2", "h3", "p", "br", "strong", "em", "ul", "ol", "li", "a", "hr", "blockquote", "img"],
    allowedAttributes: {
      a: ["href", "target", "rel", "class"],
      img: ["src", "alt", "class", "style"],
      div: ["dir", "class", "style"],
      p: ["dir", "class", "style"],
      h2: ["class", "style"],
      h3: ["class", "style"],
      blockquote: ["class", "style"],
    },
  });
}
