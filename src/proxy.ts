import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

function extractLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|he)(\/|$)/);
  return match ? match[1] : "he";
}

function buildCsp(nonce: string): string {
  const isProd = process.env.NODE_ENV === "production";
  // 'strict-dynamic' lets nonce-loaded scripts load additional scripts,
  // and (per spec) makes browsers ignore host allowlists for script-src.
  // 'unsafe-eval' / 'unsafe-inline' for scripts kept only in dev for HMR.
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(isProd ? [] : ["'unsafe-eval'", "'unsafe-inline'"]),
  ].join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://*.sentry.io https://va.vercel-scripts.com",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  // Per-request nonce for CSP. Forwarded to RSC via x-nonce so Next can
  // attach it to its inline streaming scripts.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Step 1: Run next-intl middleware (handles locale detection/redirects)
  const intlResponse = intlMiddleware(request);

  // Honor intl redirects directly (no body to protect, but still set CSP)
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    intlResponse.headers.set("Content-Security-Policy", csp);
    return intlResponse;
  }

  // Rebuild response so we can forward x-nonce on the request to RSC.
  // If intl produced a rewrite, preserve it.
  const rewriteUrl = intlResponse.headers.get("x-middleware-rewrite");
  let response = rewriteUrl
    ? NextResponse.rewrite(new URL(rewriteUrl), {
        request: { headers: requestHeaders },
      })
    : NextResponse.next({ request: { headers: requestHeaders } });

  // Carry over cookies set by intl
  intlResponse.cookies.getAll().forEach((c) => {
    response.cookies.set(c.name, c.value, c);
  });

  // Step 2: Refresh Supabase session on every request
  const { user, role, response: sessionResponse } = await updateSession(
    request,
    response
  );
  response = sessionResponse;

  // Step 3: Protect admin routes (except login)
  const isAdminRoute = request.nextUrl.pathname.match(
    /^\/(he|en)?\/admin(?!\/login)/
  );

  if (isAdminRoute) {
    const locale = extractLocale(request.nextUrl.pathname);
    const loginPath = locale === "he" ? "/admin/login" : `/en/admin/login`;

    if (!user) {
      const redirect = NextResponse.redirect(new URL(loginPath, request.url));
      redirect.headers.set("Content-Security-Policy", csp);
      return redirect;
    }

    if (!role || !["admin", "editor"].includes(role)) {
      const homeUrl = new URL(locale === "he" ? "/" : "/en", request.url);
      const redirect = NextResponse.redirect(homeUrl);
      redirect.headers.set("Content-Security-Policy", csp);
      return redirect;
    }
  }

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|auth|.*\\..*).*)",
};
