import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

function extractLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|he)(\/|$)/);
  return match ? match[1] : "he";
}

export async function middleware(request: NextRequest) {
  // Step 1: Run next-intl middleware (handles locale detection/redirects)
  const intlResponse = intlMiddleware(request);

  // Step 2: Refresh Supabase session on every request
  const { user, role, response } = await updateSession(request, intlResponse);

  // Step 3: Protect admin routes (except login)
  const isAdminRoute = request.nextUrl.pathname.match(
    /^\/(he|en)?\/admin(?!\/login)/
  );

  if (isAdminRoute) {
    const locale = extractLocale(request.nextUrl.pathname);
    const loginPath = locale === "he" ? "/admin/login" : `/en/admin/login`;

    if (!user) {
      const loginUrl = new URL(loginPath, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check role - redirect non-admin/editor users to home
    if (!role || !["admin", "editor"].includes(role)) {
      const homeUrl = new URL(locale === "he" ? "/" : "/en", request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|auth|.*\\..*).*)",
};
