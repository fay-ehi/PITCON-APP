# PITCON

Investor–startup matchmaking platform. Two strictly separate MVP account
types — Founder and Investor — no role switching in the MVP.

This repo currently contains **Sprint 0: Project Foundation** only:
project setup, design system, base UI primitives, app shell, and Supabase
plumbing. No auth, onboarding, startup creation, discovery, messaging, or
notifications yet — see the Roadmap section.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4
· Supabase (Postgres, Auth, Storage) · shadcn-style UI primitives (Radix +
CVA) · Zod · React Hook Form · TanStack Query

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
  layout.tsx              Root layout: Inter font, metadata, Providers
  providers.tsx            TanStack Query + Toaster (client component)
  globals.css               Design tokens (Tailwind v4 @theme) + base styles
  (marketing)/               Public marketing routes
    layout.tsx                Header + footer shell
    page.tsx                  Placeholder landing page

components/
  ui/                       Base primitives: button, input, textarea, label,
                             select, badge, card, avatar, dialog,
                             dropdown-menu, skeleton, sonner (toaster)
  shared/                   container.tsx, logo.tsx — used across the app
  marketing/                site-header.tsx, site-footer.tsx

lib/
  utils.ts                  cn() classname helper
  supabase/
    client.ts                Browser Supabase client
    server.ts                Server Component / Route Handler Supabase client

proxy.ts                   Next.js 16's middleware.ts replacement — refreshes
                            the Supabase session cookie on every request

types/
  database.types.ts          Placeholder Database type (no tables yet)

supabase/
  config.toml                Supabase CLI project config
  migrations/README.md       Migration workflow & DB conventions
```

Route groups and folders for `(auth)`, `(founder)`, and `(investor)`
aren't created yet — they'll appear in the sprints that actually build
those areas, rather than sitting empty now. Same for `lib/validations/`
and `lib/queries/`: they show up once there are real forms and real
queries to put in them.

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
- No `any`; run `npx tsc --noEmit` before committing.

## Roadmap (not yet built)

Authentication → Onboarding → Startup creation (Founder) → Discovery
(Investor) → Bookmarks / Investor interest → Messaging → Notifications →
Settings → the real landing page (once there's a product to screenshot).
