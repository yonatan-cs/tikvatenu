import type { ReactNode } from "react";

// This is a minimal root layout. The real layout with i18n is in [locale]/layout.tsx.
// This file exists because Next.js App Router requires a root layout.

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
