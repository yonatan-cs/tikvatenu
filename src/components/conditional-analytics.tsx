"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { hasConsentedToAnalytics } from "@/contexts/cookie-consent-context";
import { useEffect, useState } from "react";

export function ConditionalAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    setHasConsent(hasConsentedToAnalytics());
  }, []);

  if (!hasConsent) {
    return null;
  }

  return <VercelAnalytics />;
}
