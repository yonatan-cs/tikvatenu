import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Step 1: Run next-intl middleware (handles locale detection/redirects)
  const intlResponse = intlMiddleware(request);

  // Step 2: Refresh Supabase session on every request
  const { user, response } = await updateSession(request, intlResponse);

  // Step 3: Protect admin routes (except login)
  const isAdminRoute = request.nextUrl.pathname.match(
    /^\/(he|en)?\/admin(?!\/login)/
  );

  if (isAdminRoute && !user) {
    const locale = request.nextUrl.pathname.startsWith("/en") ? "en" : "he";
    const loginUrl = new URL(
      locale === "he" ? "/admin/login" : `/en/admin/login`,
      request.url
    );
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|auth|.*\\..*).*)",
};
