## Tikvatenu – Production Readiness Plan (Next.js 16)

This document complements `plan.md` and focuses specifically on **hardening the existing implementation for production**.  
It is organized by **priority** and each item contains **goal, scope, and implementation recommendations**.

---

## 🔴 Priority 1 – Must Fix Before Production

### 1. Migrate Admin CRUD Operations to Server Actions (Security & Architecture)

**Goal**  
Ensure all admin content mutations (events, articles, updates, gallery, site settings, etc.) are executed **on the server** with proper authentication and authorization, rather than directly from the browser using the public Supabase client.

**Why**  
Currently, admin forms call Supabase directly from the client (using the anon key). While the admin UI is auth‑guarded, a stolen session or manual client calls could still attempt to talk to Supabase directly. We want:

- Centralized security and validation on the server.
- Consistent enforcement of roles and RLS.
- Less exposure of DB structure to the browser.

**Scope (main places to refactor)**  
- `src/components/admin/event-form.tsx`
- `src/components/admin/article-form.tsx`
- `src/components/admin/update-form.tsx`
- `src/components/admin/gallery-form.tsx`
- Any other admin form that currently imports the browser Supabase client and performs inserts/updates/deletes directly.

**Recommended approach**

1. **Introduce dedicated Server Actions per domain**
   - For each admin domain, create a server module in `src/app/[locale]/admin/...` (or a shared server directory) that exposes functions such as:
     - `createEvent`, `updateEvent`, `deleteEvent`
     - `createArticle`, `updateArticle`
     - `createUpdate`, `updateUpdate`
     - `createGalleryAlbum`, `updateGalleryAlbum`, `addGalleryImages`, etc.
   - Mark each exported function with `"use server"` and keep them in a file that will not be imported by client components except through explicit action props.

2. **Use the Supabase Server Client within Server Actions**
   - Use your existing server Supabase helper (e.g. `createServerClient`) to:
     - Read the session from cookies.
     - Verify the authenticated user.
   - Keep **all DB writes** (insert/update/delete) inside these server actions, not in client components.

3. **Enforce authorization inside the actions**
   - Within each action, verify the current user is allowed to perform the operation (e.g. `role === 'admin' || role === 'editor'`).
   - If the user is unauthorized, throw or return a structured error (for example `{ ok: false, error: 'Not authorized' }`) so the UI can show a clear message.

4. **Refactor admin forms to call Server Actions**
   - Convert admin forms so that **submit handlers call the Server Action** instead of the browser Supabase client.
   - Use the recommended Next.js 16 pattern:
     - Either **bind** the action to the form via `<form action={createEvent}>` (preferred when possible).
     - Or call the action from a client component via an imported server function with proper types and error handling.
   - Ensure loading / success / error states in the UI are driven by the action’s return value.

5. **Harden Supabase RLS Policies in parallel**
   - Confirm that for content tables (`events`, `articles`, `updates`, `gallery_albums`, `gallery_images`, `site_settings`):
     - **Public users cannot write** (insert/update/delete).
     - Only authenticated users with an appropriate role (admin/editor) can write.
   - Prefer checking roles via:
     - A `profiles` table with `role` column, and
     - A helper function like `is_admin()` used inside RLS policies.

6. **Testing**
   - Try mutating content via the admin UI with a valid admin user → should succeed.
   - Try with a non‑admin authenticated user → should be rejected by the action.
   - Try calling Supabase directly from the browser console using the anon client for a write operation → should fail due to RLS.

---

### 2. XSS Protection – Sanitize All Rich HTML Before Rendering

**Goal**  
Prevent cross‑site scripting (XSS) when rendering rich HTML content such as updates, articles, and event bodies.

**Why**  
The project uses `dangerouslySetInnerHTML` in multiple places to render content stored as HTML. Without sanitization, a compromised admin account or human mistake could introduce malicious scripts that run in visitors’ browsers.

**Scope (where to focus first)**  
- `src/components/home/updates-feed.tsx` (body preview rendering)
- Any public components that render:
  - `body_he` / `body_en` for articles
  - `body_he` / `body_en` for events
  - Other rich text fields that are stored as HTML

**Recommended approach**

1. **Add `isomorphic-dompurify` dependency**
   - Install `isomorphic-dompurify` via npm.
   - This provides a single API that works in both Node (server) and the browser.

2. **Create a shared sanitize utility**
   - Add a file like `src/lib/utils/sanitize.ts` that exports a small wrapper:
     - Accepts a string of HTML.
     - Returns the sanitized HTML string.
   - Configure DOMPurify to:
     - Remove `<script>` tags.
     - Strip inline event handlers (`on*` attributes).
     - Optionally whitelist only a safe subset of tags/attributes appropriate for your rich text (paragraphs, headings, links, lists, basic formatting, images).

3. **Centralize usage of `dangerouslySetInnerHTML`**
   - Instead of calling `dangerouslySetInnerHTML` scattered across the codebase, create a small presentational component (e.g. `SafeHtml`):
     - Receives a `html` string.
     - Internally calls the sanitize utility.
     - Renders via `dangerouslySetInnerHTML` only after sanitization.
   - Replace all existing direct `dangerouslySetInnerHTML` usages with this `SafeHtml` component.

4. **Decide where to sanitize (write vs read)**
   - Option A – **Sanitize on write**: sanitize before saving HTML into the database.
     - Pros: database never stores unsafe HTML.
     - Cons: harder to change sanitization rules later.
   - Option B – **Sanitize on read (preferred initially)**: sanitize right before rendering.
     - Pros: easy to adjust sanitization rules without touching stored data.
   - Recommendation: start with sanitizing on read via `SafeHtml`. If needed, add a later migration that cleans existing DB content and moves sanitization to write‑time.

5. **Testing**
   - Create sample content with:
     - Plain text and allowed tags (should render correctly).
     - `<script>alert('xss')</script>` (should not execute or appear).
     - Attributes like `onclick="..."` (should be stripped).

---

### 3. Enforce Role‑Based Access in Middleware

**Goal**  
Ensure that **only users with admin/editor roles** can access `/admin` routes at the routing level, not just at the layout level.

**Why**  
Currently, the middleware verifies that a user is authenticated, but does not strictly check the user’s role. The `AdminLayout` performs role checks, but we want a single, clear enforcement point that blocks non‑admins before the admin stack is even rendered.

**Scope**  
- `src/middleware.ts`
- `src/lib/supabase/middleware.ts` (or similar helpers used to read the session)

**Recommended approach**

1. **Extend middleware session data to include the user role**
   - In `updateSession` (or equivalent), after verifying the Supabase session:
     - Fetch the user’s profile from the `profiles` table (or read role from JWT claims if available).
     - Attach the role information to the request context or response cookies.

2. **Add role checks for `/admin` routes**
   - In `middleware.ts`, when intercepting requests to `/[locale]/admin`:
     - If there is **no session** → redirect to the admin login page.
     - If there is a session but the user’s role is **not** admin/editor → redirect to a safe page (e.g. public home or a “no access” page).

3. **Keep layout‑level checks as a second line of defense**
   - Retain the existing role checks in `AdminLayout` for defense‑in‑depth and better UX (e.g. to show a clearer message if middleware is bypassed in dev).

4. **Testing**
   - As admin/editor: accessing `/admin` and nested routes should work.
   - As logged‑in non‑admin: requests to `/admin` should be redirected early by middleware.
   - As anonymous: requests to `/admin` should go to `/admin/login` (or equivalent).

---

### 4. Strengthen Server‑Side Validation for Event Registration

**Goal**  
Guarantee that all **required custom registration fields** are validated on the server, not just via HTML `required` attributes.

**Why**  
The event registration API validates core fields but does not strictly enforce all required custom fields configured for a given event. A malicious client can bypass front‑end validation by calling the API directly.

**Scope**  
- `src/app/api/register/route.ts`
- `src/components/events/registration-form.tsx` (for consistency between client and server expectations)

**Recommended approach**

1. **Load event configuration inside the API**
   - In the registration route:
     - Load the target event from the database by `event_id`.
     - Read `registration_fields` JSON for that event.

2. **Build a server‑side validation schema**
   - For each field in `registration_fields`:
     - Inspect `type` (text/email/number/select/checkbox, etc.).
     - Inspect `required` flag.
   - Validate that:
     - All `required` fields are present in the incoming payload.
     - Values conform to expected type/format (e.g. email format, number ranges, allowed options for selects).

3. **Return structured, user‑friendly errors**
   - On validation failure, return a 400 response with a JSON body that includes:
     - A general message.
     - Optionally a per‑field error map (e.g. `{ fieldId: "This field is required" }`).
   - On the client side, decide whether to:
     - Show a generic error.
     - Or highlight individual fields if you choose to wire that up.

4. **Maintain client‑side validation as a convenience**
   - Keep HTML `required` and basic client checks to provide fast feedback.
   - Treat server validation as the **source of truth** that cannot be bypassed.

5. **Testing**
   - Submit a valid payload → registration saved successfully, confirmation behavior unchanged.
   - Omit a required custom field → API returns 400 with error details, registration is not saved.
   - Try to inject invalid types (e.g. string where number is expected) → API rejects gracefully.

---

## 🟡 Priority 2 – Architecture & UX Improvements

### 5. Parallelize Supabase Calls on the Home Page

**Goal**  
Reduce time‑to‑first‑byte (TTFB) and overall page load latency by executing independent Supabase queries in parallel.

**Scope**  
- `src/app/[locale]/page.tsx` – main `HomePage` data loading.

**Recommended approach**

1. **Identify independent queries**  
Group queries that do not depend on each other, such as:
   - Upcoming event / next hero event.
   - Latest updates.
   - Featured article (via `site_settings`).
   - Instagram URL (via `site_settings`).

2. **Wrap independent calls in `Promise.all`**
   - Replace sequential `await` calls with a single `Promise.all([...])` block for these independent fetches.
   - Preserve any sequential logic only where there is a real dependency.

3. **Testing**
   - Confirm the rendered content is unchanged.
   - Measure TTFB before/after (e.g. via Chrome DevTools or Vercel metrics) to ensure improvement or at least no regression.

---

### 6. Improve Error Handling in Join/Contact Forms

**Goal**  
Make error feedback in public forms more informative for users and more useful for debugging production issues.

**Scope**  
- `src/components/join/join-form.tsx`
- `src/components/join/contact-form.tsx`
- Corresponding API routes for join/contact submissions.

**Recommended approach**

1. **Read and use API error payloads**
   - After calling the API, always parse `res.json()` on error responses.
   - If the JSON includes an `error` field:
     - Prefer to display it (safely) or combine it with a translated generic message.

2. **Preserve a clear UX**
   - For end‑users, keep the top‑level message friendly and localized.
   - Optionally show a more specific hint when it is safe and non‑technical (e.g. “invalid email address”).

3. **Add logging for unexpected errors**
   - For unexpected 500 errors, log details in the console in development.
   - Consider integrating an error monitoring service (e.g. Sentry) later, but keep this out of scope for now unless already partially integrated.

4. **Testing**
   - Simulate validation errors (missing required fields) and server errors to ensure:
     - User sees meaningful feedback.
     - Developer has enough context to debug the issue.

---

### 7. Consistent Locale‑Aware Routing and Navigation

**Goal**  
Ensure that all navigation respects the active locale, avoids hard‑coded paths, and will scale if additional locales are added in the future.

**Scope**  
- `src/components/layout/admin-sidebar.tsx`
- `src/app/[locale]/admin/login/page.tsx`
- Any other component that:
  - Hard‑codes paths like `"/"` or `"/en/..."`.
  - Uses conditions like `locale === "he"` for routing rather than relying on the i18n router.

**Recommended approach**

1. **Use `@/i18n/navigation` for all programmatic navigation**
   - Replace hard‑coded `router.push("/")` / `router.push("/admin")` calls with the locale‑aware router and link helpers provided by your i18n setup.
   - Ensure logout redirects the user to the home page in **their current locale**, not always to the default root.

2. **Avoid binary locale checks in routing**
   - Instead of `locale === "he" ? "/something" : "/en/something"`, rely on:
     - The i18n router, or
     - A centralized mapping object (e.g. `pathByLocale[locale]`) if logic is truly locale‑specific.

3. **Prepare for future locales**
   - When you must branch by locale (e.g. for directionality or specific copy), prefer:
     - A mapping object keyed by locale code.
     - Or falling back gracefully when encountering an unexpected locale.

4. **Testing**
   - Navigate through the site in Hebrew and English:
     - Ensure all links (header, footer, admin sidebar, redirects after login/logout) stay in the right locale.
   - Simulate adding a third locale in config (even temporarily) and ensure routing code does not crash or produce obviously wrong URLs.

---

### 8. Consolidate Global Settings Fetching (e.g. Instagram URL)

**Goal**  
Avoid duplicate data fetching for global configuration values such as `instagram_url` by fetching them once and reusing them.

**Scope**  
- `src/app/[locale]/page.tsx` (server‑side fetching of settings)
- `src/components/layout/footer.tsx` (client‑side fetch of the same setting)

**Recommended approach**

1. **Choose a single source of truth for settings**
   - Prefer fetching global settings on the server in a layout or page component.
   - Pass the needed values (e.g. `instagramUrl`) as props to children like `Footer`.

2. **Refactor `Footer` to avoid extra client fetch**
   - If possible, make `Footer` a server component that simply receives the settings as props.
   - If `Footer` must remain a client component (due to interactive elements), still pass `instagramUrl` from the parent that already fetched it.

3. **Generalize the pattern**
   - If you have other global settings (featured article, hero configuration, etc.), consider:
     - A small settings loader utility used in layouts.
     - A typed config object passed down through props or context.

4. **Testing**
   - Confirm that:
     - The footer still shows the correct Instagram link.
     - No additional Supabase calls are made for this setting on the client.

---

## 🟢 Explicitly Cancelled / Not To Do

### 9. Do **Not** Change `params` from Async to Sync

**Status**  
Cancelled – the current implementation is **correct** for Next.js 16.

**Reason**  
In Next.js 15 and above (including 16.1.6, which this project uses), `params` and `searchParams` in the App Router are **asynchronous** and exposed as Promises. Using `await params` is the correct, modern pattern. Converting `params` back to a synchronous object would be:

- Incorrect for the current Next.js version.
- Likely to cause type errors and possibly runtime issues.

**Action**  
Leave all existing `params` usage as‑is unless upgrading instructions from Vercel explicitly change this behavior in the future.

