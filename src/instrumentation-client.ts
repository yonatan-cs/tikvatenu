// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

function hasConsentedToAnalytics(): boolean {
  if (typeof document === "undefined") return false;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; tikvatenu_cookie_consent=`);
  if (parts.length === 2) {
    const consent = parts.pop()?.split(";").shift();
    return consent === "accepted";
  }
  return false;
}

const hasConsent = hasConsentedToAnalytics();

Sentry.init({
  dsn: "https://592d8e155c197459658c3a62942f86de@o4511049597059072.ingest.de.sentry.io/4511049599025232",

  // Add Session Replay only if user has consented
  integrations: hasConsent ? [Sentry.replayIntegration()] : [],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: hasConsent ? 0.1 : 0,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: hasConsent ? 1.0 : 0,

  // Minimize PII: do not send user IP, username, or email by default
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
