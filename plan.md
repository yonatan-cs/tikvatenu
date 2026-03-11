# Tikvatenu (תקוותנו) - Website Implementation Plan

## Progress Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0: Documentation | **COMPLETE** | plan.md + README.md created |
| Phase 1: Foundation | **COMPLETE** | Next.js 15, i18n, Supabase clients, layout, all page stubs |
| Phase 2: Database & Admin Auth | **COMPLETE** | All tables, RLS, storage buckets, admin login + dashboard |
| Phase 3: Events System | **COMPLETE** | Event CRUD, registration forms, admin management |
| Phase 4: Magazine | **COMPLETE** | Article CRUD with tags, public magazine pages |
| Phase 5: Home Page & Feed | **COMPLETE** | Hero, feed, Instagram widget, featured article |
| Phase 6: Gallery & Past Events | **COMPLETE** | Photo albums, lightbox, past event summaries |
| Phase 7: About + Join Us + Polish | **COMPLETE** | About page, Join forms, admin submissions, email, SEO, sitemap |
| Phase 8: Deployment | PENDING | Vercel deploy, tikvatenu.com domain |

**Last updated**: 2026-03-11

---

## Context

תקוותנו is a Zionist youth initiative focused on building bridges in Israeli society through dialogue, events, and community building. The initiative needs a bilingual (Hebrew/English) website to replace ad-hoc Google Docs and scattered tools with an organized platform for publishing events, managing registrations, sharing articles/thought pieces, and keeping a public content feed. The site needs a friendly admin panel for 2-5 non-technical editors.

**Logo**: Blue botanical design with olive branches, text "תִקְוָתֵנוּ - צעירים למען עתיד ישראל" (transparent PNG at `transparent_logo.png`, JPG fallback at `logo.jpg`)

**Content source**: `אתר תקוותנו.md` contains the initiative's vision, values, event history, and rich Hebrew texts for use throughout the site.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **Next.js 15** (App Router) | SSR, great Vercel integration, i18n support |
| Language | **TypeScript** | Type safety |
| Styling | **Tailwind CSS v4** + logical properties for RTL | Fast, RTL-friendly |
| UI Components | **shadcn/ui** (Radix primitives) | Accessible, customizable, Tailwind-native |
| i18n | **next-intl** | Best Next.js App Router i18n library |
| Database | **Supabase** (PostgreSQL) | Free tier, auth, storage, RLS, real-time |
| Auth | **Supabase Auth** (email/password for admins) | Built-in, simple |
| File Storage | **Supabase Storage** | Images for events, articles, gallery |
| Rich Text Editor | **Tiptap** | RTL support, headless, Tailwind-friendly |
| Hosting | **Vercel** | Free tier, auto-deploy from Git |
| Fonts | **Heebo** (Hebrew) + **Inter** (English) | Clean, modern |

**Not in v1**: Payments (Stripe/Meshulam/Tranzila - requires business entity for credit card processing), donations page

---

## Functional Requirements & Challenges

### Event Management System
- Create/edit events with dynamic registration forms (custom fields per event)
- Participant limit (`max_participants`) with automatic "full" / waitlist state
- Dynamic registration form: admins define fields (text, number, email, phone, select, checkbox) per event
- **Automatic confirmation email** on registration (via Resend API - free tier 100 emails/day)
- Registration deadline enforcement
- Admin view: registrations table with CSV export, participant count, status management

### Bilingual Support (i18n) - Full RTL/LTR Flip
This is NOT just text translation. The entire UI must mirror:
- All layout directions flip (menus, buttons, text alignment, icons)
- Use Tailwind **logical properties** everywhere (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) instead of `ml-`, `mr-`, `left-`, `right-`
- `dir="rtl"` / `dir="ltr"` on `<html>` based on locale
- Tiptap editor respects text direction per language tab
- Navigation, dropdowns, sidebars all flip correctly

### Payments (Future - NOT in v1)
- Free registration only for now
- When needed: integrate Stripe (international) or Meshulam/Tranzila (Israeli processors)
- Requires opening a registered business/amuta (עמותה) with credit card companies

### Instagram Integration
- Embed latest Instagram posts on home page
- Options: Instagram Basic Display API, or simple embed widget, or manual curated links
- Fallback if API unavailable: link to Instagram profile with latest post images uploaded manually

### Email System
- **Resend** for transactional emails (free tier: 100/day, 3000/month)
- Event registration confirmation
- Future: newsletter, event reminders

---

## Frontend Design Skill (Plugin)

Install the `frontend-design` plugin from `anthropics/claude-code` to ensure distinctive, production-grade UI. The plugin SKILL.md goes in `.claude/skills/frontend-design/SKILL.md`.

**Installation step** (Phase 1): Create `.claude/skills/frontend-design/SKILL.md` with the skill content from the GitHub repo.

## Design Direction

**Aesthetic**: Organic/botanical - inspired by the logo's hand-drawn olive branches. Not corporate-clean but warm, alive, and rooted. Think editorial magazine meets nature journal. The design should feel like it was crafted by people who care deeply about community and dialogue.

**Differentiation**: The botanical illustration style from the logo carries through the site as decorative elements - subtle leaf patterns, organic dividers, hand-drawn-feeling borders. This makes the site instantly recognizable and distinct from generic NGO/initiative sites.

**Color palette** (derived from logo):
- **Primary navy**: `#1e3a5f` (deep blue from logo text)
- **Branch blue**: `#4a7fb5` (lighter blue from botanical illustrations)
- **Sky accent**: `#7ba7cc` (softer blue for hover states/backgrounds)
- **Warm terracotta**: `#c8956c` (warm accent for CTAs, highlights, hope)
- **Warm cream**: `#faf7f2` (background - warm, not sterile white)
- **Deep text**: `#1a1a1a` on light, `#f0ede8` on dark sections
- **Success/growth green**: `#5a8a6a` (subtle, for positive states)

**Typography** (distinctive, not generic):
- **Hebrew display**: `Karantina` or `Secular One` (bold, characterful for headlines)
- **Hebrew body**: `Heebo` (clean, readable)
- **English display**: `Playfair Display` or `DM Serif Display` (editorial feel)
- **English body**: `Source Sans 3` (readable, pairs well)

**Motion**: Subtle botanical-feeling animations - elements that grow/unfold on scroll, staggered reveals on page load, gentle hover lifts on cards. CSS-first, Motion library for React components.

**Layout**: Generous whitespace, asymmetric hero sections, overlapping elements where appropriate, grid-breaking moments. Not a cookie-cutter template.

**Textures**: Subtle noise/grain overlay on hero sections, organic divider SVGs derived from the logo's branch style, soft shadows.

- Mobile-first responsive design

---

## Database Schema (Supabase PostgreSQL)

### Tables

**`profiles`** - extends Supabase auth.users
- `id` uuid PK (FK -> auth.users), `full_name` text, `role` text ('admin'|'editor'), `avatar_url` text, `created_at`, `updated_at`

**`events`** - event listings with registration
- `id` uuid PK, `slug` text UNIQUE, `title_he`/`title_en`, `description_he`/`description_en`, `body_he`/`body_en` (rich text HTML), `cover_image` text, `location_he`/`location_en`, `location_url`, `event_date` timestamptz, `event_end_date`, `registration_deadline`, `max_participants` int, `registration_fields` jsonb (custom form fields), `is_published` bool, `summary_he`/`summary_en` (post-event), `author_id` FK, timestamps

**`event_registrations`** - public registrations
- `id` uuid PK, `event_id` FK, `full_name`, `email`, `phone`, `custom_fields` jsonb, `status` ('confirmed'|'cancelled'|'waitlist'), `created_at`. UNIQUE(event_id, email)

**`articles`** - magazine content (thought/הגות, press/כתבות, spirit/רוח)
- `id` uuid PK, `slug` UNIQUE, `title_he`/`title_en`, `excerpt_he`/`excerpt_en`, `body_he`/`body_en`, `cover_image`, `category` ('thought'|'press'|'opinion'|'spirit'), `tags` text[], `is_published`, `published_at`, `author_id` FK, timestamps

**`updates`** - home feed news/updates (short announcements)
- `id` uuid PK, `slug` UNIQUE, `title_he`/`title_en`, `body_he`/`body_en`, `cover_image`, `is_published`, `published_at`, `author_id` FK, timestamps

**`join_submissions`** - community join form entries
- `id` uuid PK, `full_name`, `email`, `phone`, `interests` text, `how_heard` text, `message` text, `is_read` bool, `created_at`

**`site_settings`** - configurable home page settings (featured article, hero config)
- `id` uuid PK, `key` text UNIQUE, `value` jsonb, `updated_at`

**`gallery_albums`** - photo albums linked to events
- `id` uuid PK, `title_he`/`title_en`, `description_he`/`description_en`, `cover_image`, `event_id` FK (optional), `is_published`, `sort_order`, `author_id` FK, `created_at`

**`gallery_images`** - individual photos
- `id` uuid PK, `album_id` FK CASCADE, `image_url`, `caption_he`/`caption_en`, `sort_order`, `created_at`

**`contact_submissions`** - contact form entries
- `id` uuid PK, `name`, `email`, `subject`, `message`, `is_read` bool, `created_at`

**`content_feed`** - PostgreSQL VIEW unioning all published content types for the home feed

### Key DB Objects
- `is_admin()` function for RLS policies
- `update_updated_at()` trigger on all content tables
- RLS: public SELECT on published content, authenticated INSERT/UPDATE/DELETE for admins
- Public INSERT on `event_registrations` (with published event check) and `contact_submissions`

---

## Information Architecture

**Problem**: Too many content types (about, photos, articles, thought, spirit, events, summaries, updates...) risk cognitive overload if placed as separate nav items.

**Solution**: Consolidate into **5 main navigation items** with sub-content within each:

### 1. **Home** (`/`) - The Feed
- **Hero Section**: Next upcoming event (large, prominent, with CTA to register)
- **News/Updates Feed**: Clean social-media-style feed of latest content (updates, new articles, event announcements)
- **Instagram Widget**: Pull latest posts from Instagram (using Instagram Basic Display API or embed)
- **Featured Quote/Article**: Highlighted thought piece or inspiring quote, rotated by admins

### 2. **About** (`/about`)
- Who we are, why we exist, the vision (the problem and solution)
- Team/leaders section with photos and short bios
- Photos from the initiative's activities (mini gallery)

### 3. **Events** (`/events`)
- **Upcoming Events** tab: Calendar/list view with registration CTA buttons
  - Each event page (`/events/[slug]`): full details + dynamic registration form
- **Past Events** tab: Archive with summaries, photo galleries, discussion insights
  - Each past event: summary text + photo gallery + key takeaways

### 4. **Magazine** (`/magazine`) - רוח ותוכן
- Blog-style layout for: thought pieces (הגות), spirit (רוח), articles/press (כתבות)
- **Tag-based filtering** (not separate pages per category)
- Individual article pages (`/magazine/[slug]`)

### 5. **Join Us** (`/join`) - הצטרפות / יצירת קשר
- Community join form (name, email, interests, how they heard about us)
- Social media links (Instagram, etc.)
- Contact form for general inquiries
- Future: donation button

## Page Structure & Routing

next-intl with `localePrefix: 'as-needed'` - Hebrew has clean URLs (`/events`), English gets prefix (`/en/events`).

### Public Pages (`src/app/[locale]/`)
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero (next event) + feed + Instagram + featured article |
| About | `/about` | Mission, team, vision, activity photos |
| Events | `/events` | Upcoming + past events (tabbed) |
| Event Detail | `/events/[slug]` | Event info + registration form |
| Magazine | `/magazine` | Articles/thought/press with tag filters |
| Article Detail | `/magazine/[slug]` | Full article |
| Join Us | `/join` | Join form + contact + social links |

### Admin Pages (`src/app/[locale]/admin/`)
| Page | Route | Description |
|------|-------|-------------|
| Login | `/admin/login` | Email/password login |
| Dashboard | `/admin` | Stats + quick actions |
| Events List | `/admin/events` | Manage events table |
| New Event | `/admin/events/new` | Create event form |
| Edit Event | `/admin/events/[id]` | Edit event form |
| Registrations | `/admin/events/[id]/registrations` | View + export registrations |
| Magazine CRUD | `/admin/magazine`, `/admin/magazine/new`, `/admin/magazine/[id]` | Manage articles/thought/press |
| Updates CRUD | `/admin/updates`, `/admin/updates/new`, `/admin/updates/[id]` | Manage news feed updates |
| Gallery CRUD | `/admin/gallery`, `/admin/gallery/new`, `/admin/gallery/[id]` | Manage photo albums |
| Join Submissions | `/admin/submissions` | View community join + contact form submissions |
| Home Settings | `/admin/home` | Set featured article, manage Instagram, hero config |

---

## Admin Panel Design

- **Auth**: Supabase email/password. No self-registration - admins added manually.
- **Layout**: Sidebar nav (icons + labels), collapsible on mobile, main content area
- **Content editing**: Tabbed "Hebrew | English" interface for bilingual fields, Tiptap rich text editor with RTL toggle, drag-and-drop image upload
- **Event registration builder**: Visual field builder - add rows with label (he/en), type (text/number/email/select/checkbox), required toggle, drag to reorder
- **Tables**: Sortable data tables with publish/unpublish toggle, edit/delete actions
- **Dashboard**: Stats cards (upcoming events, registrations, articles, unread messages) + quick-action buttons

---

## Key Components

**Layout**: `header.tsx`, `footer.tsx`, `mobile-nav.tsx`, `locale-switcher.tsx`, `admin-sidebar.tsx`

**Home**: `hero-event.tsx` (next upcoming event hero), `updates-feed.tsx` (news feed), `instagram-widget.tsx`, `featured-article.tsx`

**Content**: `content-card.tsx` (polymorphic card), `bilingual-text.tsx`, `tag-filter.tsx`

**Events**: `event-card.tsx`, `event-detail.tsx`, `registration-form.tsx` (dynamic from JSONB), `past-event-summary.tsx`

**Gallery**: `gallery-grid.tsx`, `gallery-lightbox.tsx`

**Admin**: `rich-text-editor.tsx`, `image-uploader.tsx`, `content-form.tsx` (bilingual wrapper), `event-form.tsx`, `registration-field-builder.tsx`, `registrations-table.tsx`, `data-table.tsx`

**UI (shadcn/ui)**: Button, Input, Textarea, Select, Card, Dialog, Tabs, Badge, Skeleton, Toast

---

## Implementation Phases

### Phase 0: Documentation (First!) - COMPLETE
- [x] Full plan saved as `plan.md` in project root
- [x] Bilingual `README.md` created (Hebrew + English)

### Phase 1: Foundation - COMPLETE
- [x] `frontend-design` skill installed at `.claude/skills/frontend-design/SKILL.md`
- [x] Next.js 15 project with TypeScript + Tailwind CSS v4 + App Router
- [x] next-intl configured (he default, en with prefix, `localePrefix: 'as-needed'`)
- [x] Supabase clients (browser: `createBrowserClient`, server: `createServerClient`, middleware: `updateSession`)
- [x] Combined middleware (next-intl locale detection + Supabase auth check for `/admin/*` excluding `/admin/login`)
- [x] Root `[locale]/layout.tsx` with fonts (Heebo, Playfair Display, Source Sans 3, Secular One), RTL/LTR `dir`
- [x] Header (sticky, logo, 5 nav items, locale switcher, hamburger menu)
- [x] Footer (dark navy, logo, nav links, Instagram icon)
- [x] LocaleSwitcher (Hebrew/English toggle)
- [x] MobileNav dropdown
- [x] All 5 public page stubs: Home (hero placeholder), About, Events, Magazine, Join
- [x] `globals.css` with full Tikvatenu color palette, botanical design system, grain overlay, staggered animations
- [x] Translation files: `he.json` + `en.json` (nav, home, about, events, magazine, join, common, footer)
- [x] 404 page

### Phase 2: Database & Admin Auth - COMPLETE
- [x] SQL migrations executed on Supabase (`001_initial_schema.sql`, `002_rls_policies.sql`, `003_storage_buckets.sql`)
- [x] All tables: profiles, events, event_registrations, articles, updates, gallery_albums, gallery_images, join_submissions, contact_submissions, site_settings
- [x] `content_feed` PostgreSQL VIEW for unified home feed
- [x] RLS policies: public read on published content, admin write, public insert for registrations/submissions
- [x] Storage buckets: event-images, article-images, gallery-images, general (public read, admin write)
- [x] `is_admin()` function + `update_updated_at()` triggers
- [x] Admin login page (`/admin/login`) - client component with Supabase `signInWithPassword`
- [x] Admin layout with sidebar (auth-guarded via Next.js route groups: `(dashboard)/`)
- [x] Admin dashboard with stats cards (events, articles, registrations, messages) + quick actions
- [x] Admin sidebar: Dashboard, Events, Magazine, Updates, Gallery, Submissions, Logout
- [x] Admin route stubs: events (list/new/[id]/registrations), magazine, gallery, updates, home settings, submissions
- [x] Auth callback route (`/auth/callback`)
- [x] Admin user created: `admin@tikvatenu.com` / `Tikvatenu2026!` (role: admin)
- [x] Domain `tikvatenu.com` purchased
- [x] Supabase project: `https://nglvrwqxcstzrjnlogzy.supabase.co`

### Phase 3: Events System (core feature) - COMPLETE
- [x] shadcn/ui base components (Button, Input, Card, Dialog, Badge, Tabs, Select, Switch, Skeleton, Label)
- [x] `cn()` utility with clsx + tailwind-merge
- [x] TypeScript types for all database entities (`src/lib/types/database.ts`)
- [x] Image uploader (Supabase Storage, drag-and-drop, preview)
- [x] Tiptap rich text editor with RTL support, text alignment, toolbar
- [x] Registration field builder (dynamic JSONB fields: text, email, phone, number, select, checkbox)
- [x] Event create/edit form with bilingual tabs (Hebrew/English content, cover image, location, dates, registration settings)
- [x] Admin events list page with date badges, status indicators, quick actions
- [x] Public events list page (upcoming + past sections, registration counts)
- [x] Public event detail page (`/events/[slug]`) with hero image, info pills, rich content, sidebar registration
- [x] Public registration form (rendered from JSONB fields, capacity check, duplicate prevention)
- [x] Registration API route (`/api/register`) with validation, deadline check, capacity/waitlist, duplicate guard
- [x] Admin registrations view with stats cards, search, status management (confirmed/waitlist/cancelled)
- [x] CSV export with UTF-8 BOM for Hebrew support
- [x] Build passes cleanly - all routes verified

### Phase 4: Magazine (רוח ותוכן) - COMPLETE
- [x] Admin article form (`article-form.tsx`) with category select, tag builder, bilingual content, Tiptap editor, cover image
- [x] Admin magazine list with category badges, tag display, edit/view links
- [x] Public magazine page (`/magazine`) with category + tag filtering (URL search params)
- [x] Magazine filters client component (`magazine-filters.tsx`) for interactive category/tag selection
- [x] Article card component (`article-card.tsx`) with cover image, category badge, tags, date
- [x] Public article detail page (`/magazine/[slug]`) with hero image, metadata, rich content, SEO
- [x] `generateMetadata` for article SEO (title, description, OG images)
- [x] Build passes cleanly - all routes verified

### Phase 5: Home Page & Feed - COMPLETE
- [x] **Hero section** (`hero-event.tsx`): next upcoming event with cover image, date/time/location pills, prominent CTA; fallback hero when no upcoming events
- [x] **Updates feed** (`updates-feed.tsx`): grid of latest published updates with cover images, rich text preview, dates
- [x] **Featured article** (`featured-article.tsx`): large card with image, category badge, excerpt, read-more link
- [x] **Instagram widget** (`instagram-widget.tsx`): branded link to Instagram profile
- [x] Admin Updates CRUD: list page, create/edit forms with bilingual Tiptap editor
- [x] Admin Home Settings page: featured article selector, Instagram URL configuration
- [x] `site_settings` upsert for `featured_article_id` and `instagram_url`
- [x] Home Settings link added to admin sidebar
- [x] Build passes cleanly - all routes verified

### Phase 6: Gallery & Past Events - COMPLETE
- [x] Admin gallery album CRUD: list page with photo counts, create/edit forms
- [x] Gallery form with bilingual titles, cover image, event linking (optional FK to events)
- [x] Batch image uploader with progress indicator (multi-file upload to Supabase Storage)
- [x] Image grid management in admin with remove capability
- [x] Public gallery lightbox (`gallery-lightbox.tsx`): keyboard navigation (Escape/arrows), counter, RTL-aware
- [x] Event-gallery integration: past event detail pages show linked gallery photos with lightbox
- [x] Build passes cleanly - all routes verified

### Phase 7: About + Join Us + Polish - COMPLETE
- [x] About page (`/about`): hero section, mission/problem/solution, values cards (dialogue, bridges, hope, youth), activity photos from gallery, CTA section
- [x] Join Us page (`/join`): working join form (name, email, phone, interests, how heard, message) + contact form (name, email, subject, message), social links, success states
- [x] API routes: `/api/join` (join_submissions insert), `/api/contact` (contact_submissions insert)
- [x] Admin submissions page (`/admin/submissions`): tabbed view (join/contact), stats cards, read/unread toggle, search
- [x] Resend email confirmation on event registration: HTML email template, graceful fallback if not configured
- [x] Instagram links already in footer/header (from Phase 1/5)
- [x] SEO: `generateMetadata` on all public pages (about, join, events, magazine, event detail, article detail)
- [x] Sitemap (`/sitemap.xml`): static pages + dynamic events/articles, both locales
- [x] `hreflang` alternates in root layout metadata, metadataBase, Open Graph, Twitter cards
- [x] Loading skeletons: events, magazine, about pages
- [x] Error boundary (`error.tsx`) with retry button
- [x] 404 page (from Phase 1)
- [x] Translation files updated with all new keys (about, join, common sections)
- [x] Build passes cleanly - all routes verified

### Phase 8: Deployment
- Deploy to Vercel
- Configure env variables
- Connect custom domain (tikvatenu.com)
- Production testing

---

## Verification Plan

After each phase, verify by:
1. Running `npm run dev` and testing locally
2. Checking both Hebrew and English versions
3. Testing RTL layout correctness
4. Testing admin panel CRUD operations
5. Testing on mobile viewport
6. Final: full end-to-end test of the user journey (browse -> register for event -> admin views registration)

---

## Files to Create (initial setup)

```
tikvatenu/
├── .claude/skills/frontend-design/SKILL.md  # Frontend design skill
├── .env.local                 # Supabase + Resend keys (git-ignored)
├── .env.example               # Template
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── package.json
├── README.md
├── supabase/migrations/       # SQL files
├── public/images/logo.jpg
├── src/
│   ├── i18n/                  # routing.ts, navigation.ts, request.ts
│   ├── messages/              # he.json, en.json
│   ├── lib/supabase/          # client.ts, server.ts, middleware.ts
│   ├── lib/types/             # database.ts, content.ts
│   ├── components/
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── layout/           # header, footer, nav, locale-switcher, admin-sidebar
│   │   ├── home/             # hero-event, updates-feed, instagram-widget, featured-article
│   │   ├── events/           # event-card, registration-form, past-event-summary
│   │   ├── magazine/         # article-card, tag-filter
│   │   ├── gallery/          # gallery-grid, lightbox
│   │   ├── admin/            # editor, uploader, forms, tables
│   │   └── shared/           # bilingual-text, seo, pagination, loading
│   ├── middleware.ts           # Combined next-intl + Supabase
│   └── app/
│       ├── [locale]/
│       │   ├── page.tsx       # Home (hero + feed + instagram + featured)
│       │   ├── about/         # About page
│       │   ├── events/        # Events list + [slug] detail
│       │   ├── magazine/      # Magazine list + [slug] detail
│       │   ├── join/          # Join + contact
│       │   └── admin/         # Admin panel (all CRUD pages)
│       ├── api/               # contact, join, revalidate, email routes
│       └── auth/callback/     # Supabase auth callback
```

## Navigation Structure (5 items only)

```
Header: [Logo] ---- [בית] [אודות] [אירועים] [רוח ותוכן] [הצטרפות] ---- [עב/EN]
```

Clean, focused, no cognitive overload. Sub-content lives within each section, not as separate nav items.
