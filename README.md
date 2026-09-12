# PITCON

Investor–startup matchmaking platform. Two strictly separate account
types — Founder and Investor — no role switching.

Auth, onboarding, startup creation/editing, investor discovery, investor
interest, in-app messaging, notifications, settings, transactional
email, error monitoring, an internal admin view, and the marketing
landing page are all implemented — see the Roadmap section for what
isn't.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4
· Supabase (Postgres, Auth, Storage) · shadcn-style UI primitives (Radix +
CVA) · Zod · React Hook Form · TanStack Query · Resend (transactional
email) · Sentry (error monitoring)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project's values
npm run dev
```

Open http://localhost:3000.

### Environment variables

See `.env.example` for the full list and where to find each value in your
Supabase project settings. In short:

| Variable | Where it's used | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `proxy.ts` | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | same | Yes |
| `SUPABASE_SECRET_KEY` | reserved for future server-only admin operations | **No — never** |

## Project structure

```
app/
  layout.tsx                Root layout: Inter font, metadata, Providers
  error.tsx / global-error.tsx  Root-level error boundaries (see below)
  providers.tsx              TanStack Query + Toaster (client component)
  globals.css                 Design tokens (Tailwind v4 @theme) + base styles
  sitemap.ts / robots.ts       SEO — see "SEO" below
  opengraph-image.tsx          Site-wide OG image (auto-detected by Next.js)
  (marketing)/                 Public marketing routes
    layout.tsx                  Header + footer shell
    page.tsx                     Landing page (Hero, How It Works, Product
                                  Showcase, Final CTA)
  (auth)/                       login, signup, forgot-password,
                                 reset-password, verify-email — shared
                                 centered-card layout, shared error/loading
  auth/confirm/route.ts          Supabase email-link confirmation handler
  founder/                      Founder application shell + workspace
    layout.tsx                    Sidebar + top bar, enforces the
                                   founder role, redirects signed-out users
    startups/                     My Startups (landing workspace), one
                                   startup's view + edit/create form
    interests/, notifications/, messages/, profile/, settings/,
    onboarding/                  One route each, each with its own
                                   error.tsx + loading.tsx
  investor/                     Investor application shell + workspace
    layout.tsx                    Top bar only (no sidebar), enforces the
                                   investor role, redirects signed-out users
    discover/                     Investor's landing workspace
    interests/, notifications/, messages/, profile/, settings/,
    onboarding/                  Mirrors the founder routes above
  admin/                        Internal-only admin view — see "Admin view"

components/
  ui/                       Base primitives: button, input, textarea, label,
                             select, badge, card, avatar, dialog,
                             dropdown-menu, skeleton, sonner (toaster)
  shared/                   container.tsx, logo.tsx, interest-status-badge.tsx
                            — used across founder + investor
  marketing/, founder/, investor/, startup/, profile/, messaging/,
  notifications/, onboarding/, admin/   Feature-scoped components, one
                             folder per area

lib/
  utils.ts                  cn() classname helper
  site-url.ts                Canonical deployment URL for auth redirect links
  error-reporting.ts          Shared reportError() called from every
                               error.tsx — logs + reports to Sentry
  supabase/
    client.ts                Browser Supabase client
    server.ts                Server Component / Route Handler Supabase client
    admin.ts                  Service-role client (bypasses RLS) — email
                               address lookups and the admin view only
  admin/                      Email-allowlist access check — see "Admin view"
  email/                      Resend wrapper, templates, HTML shell — see
                               "Transactional email"
  auth/                      Session helpers, sign-in/out/up actions
  queries/                   Server-side data access (startups, interests,
                              notifications, messages, profile lookups, and
                              the admin view's cross-user lookups)
  startup/, profile/, discover/, interests/, messages/, notifications/,
  onboarding/, format/, validations/    Feature-scoped helpers and Zod schemas

proxy.ts                   Next.js 16's middleware.ts replacement — refreshes
                            the Supabase session cookie on every request and
                            redirects signed-out visitors away from
                            /founder and /investor (role-specific checks
                            happen one layer down, in each area's layout.tsx)

instrumentation.ts             Next.js server instrumentation hook — loads
                                the right Sentry config per runtime
instrumentation-client.ts      Sentry browser init
sentry.server.config.ts        Sentry Node runtime init
sentry.edge.config.ts          Sentry edge runtime init (covers proxy.ts)

types/
  database.types.ts          Generated Supabase Database type

supabase/
  config.toml                Supabase CLI project config
  migrations/                 One file per schema change, RLS enabled in the
                               same migration that creates each table —
                               see migrations/README.md for the workflow
  templates/                  Supabase Auth email templates

.github/workflows/ci.yml    Lint + typecheck + build on every push/PR
```

## Error and loading states

Every route has its own `error.tsx` and `loading.tsx` (or inherits a
shared one from its route group — `(auth)` and `(marketing)` share a
single pair each, since their pages are simple enough not to need
bespoke ones). `app/error.tsx` is the fallback for anything a
layout.tsx itself throws that isn't caught by a more specific boundary
below it; `app/global-error.tsx` is the last resort if the root layout
fails. None of these ever render a raw thrown error to the user — every
one calls the shared `reportError()` (`lib/error-reporting.ts`), which
logs locally and reports to Sentry, then shows a generic retry action.

## Transactional email

Powered by [Resend](https://resend.com) — see `lib/email/` and
`.env.example` for setup. Two triggers today, both fired from inside the
Server Action that causes them (via Next's `after()`, so the API call
never adds latency to the user-facing action):

- **New investor interest** → the founder, from `expressInterestAction`
- **New message** → whichever participant didn't send it, from
  `sendMessageAction` — there's no in-app `notifications` row for this
  yet (see that action's own comment), so email is currently the only
  out-of-band signal for a new message

Every send is best-effort: `sendEmail()` never throws, so a Resend
outage can't turn a successful interest/message into a failed one — it
just logs and moves on. A weekly re-engagement digest for inactive users
isn't built — see Roadmap.

## Error monitoring

[Sentry](https://sentry.io) — see `instrumentation.ts`,
`instrumentation-client.ts`, `sentry.server.config.ts`,
`sentry.edge.config.ts`, and `.env.example` for setup. Disabled outside
`NODE_ENV=production` regardless of whether a DSN is set, so local dev
never needs one. `Sentry.setUser({ id })` is set once per request in
`founder/layout.tsx`, `investor/layout.tsx`, and `admin/layout.tsx` so
an event can be traced back to an account.

## Admin view

`/admin` — recent signups and recent interests, read via the service-role
client (`lib/supabase/admin.ts`) since it's intentionally cross-user data
no normal RLS session could see. Gated by a plain email allowlist
(`ADMIN_EMAILS`, see `lib/admin/auth.ts`) rather than a new `is_admin`
role — reasonable for a handful of trusted operators, worth revisiting
if that stops being true. A non-admin who's signed in gets a plain 404,
not an "access denied" page.

There's no flagged-content panel — no flagging/reporting mechanism
exists anywhere in the schema yet, and building one (a table, RLS, a
report action in the UI, a review queue here) is a real feature, not
something this page should fake with an empty table.

## SEO

`app/sitemap.ts` (just the landing page — auth pages and everything
under `/founder`/`/investor`/`/admin` aren't public content),
`app/robots.ts` (disallows `/founder`, `/investor`, `/admin`), and
`app/opengraph-image.tsx` (a generated card using the same wordmark
treatment as `components/shared/logo.tsx`, since there's no logo asset
yet — update both together if that changes).

## Design system

All design tokens live in `app/globals.css` as Tailwind v4 `@theme`
variables — component code should never hardcode a color, radius, or
shadow value.

- **Color**: `primary-{50…900}` (brand purple, anchored on `#7634C8`) and
  `gray-{50…900}` (neutral scale; `gray-200` = `#E5E5E5`, the doc's
  default border color). Semantic aliases (`background`, `foreground`,
  `border`, `ring`, etc.) are layered on top so a future theming pass
  only touches one place.
- **Typography**: `text-display / h1 / h2 / h3 / body-lg / body / small /
  caption` utilities. Display/H1/H2/H3 use `clamp()` so they scale
  fluidly between the doc's mobile and desktop sizes instead of jumping
  at one breakpoint. Font weights use Tailwind's stock
  `font-normal/medium/semibold/bold` (400/500/600/700), which already
  match the doc.
- **Radius**: `rounded-control` (8px), `rounded-input` (10px),
  `rounded-card` (14px), `rounded-marketing` (20px), `rounded-pill`.
- **Shadows**: `shadow-subtle`, `shadow-medium`, `shadow-strong`.
- **Spacing & breakpoints**: intentionally *not* redefined — Tailwind's
  default spacing scale (4px steps) and `md`/`lg` breakpoints (768px /
  1024px) already match the doc exactly. Mobile = no prefix, Tablet =
  `md:`, Desktop = `lg:`.
- **Content width**: `max-w-content` (1280px, standard), `max-w-wide`
  (1440px, wide marketing sections) — or use the `<Container>` component.

Dark mode is intentionally not implemented. The doc specifies a
white-first, purple-as-accent interface; Next.js's default scaffold ships
an automatic `prefers-color-scheme: dark` override, which would fight
that requirement for anyone with a dark OS theme, so it's been removed.
Flag if that assumption is wrong.

## Conventions

- Files: kebab-case (`site-header.tsx`); components: PascalCase; hooks:
  `useCamelCase`.
- Import via the `@/` alias, not relative paths across directories.
- All Supabase access goes through `lib/supabase/client.ts` (Client
  Components) or `lib/supabase/server.ts` (Server Components / Route
  Handlers) — never instantiate a Supabase client inline.
- Every new table's migration enables RLS in the same file it's created
  in — see `supabase/migrations/README.md`.
- No `any`; run `npm run typecheck` before committing.
- Every route gets its own `error.tsx` + `loading.tsx` (or is covered by
  a route-group-level pair) — see "Error and loading states" above.

## CI

`.github/workflows/ci.yml` runs lint, typecheck, and build on every push
and pull request. There's no automated test suite yet — see Roadmap.

## Roadmap (not yet built)

- Automated tests (auth, RLS-sensitive queries, message send/retry path)
- A weekly re-engagement digest email for inactive users (see
  "Transactional email" above for what's already built)
- Product analytics (onboarding drop-off, activation funnel)
- A flagged-content/reporting mechanism (see "Admin view" above)
