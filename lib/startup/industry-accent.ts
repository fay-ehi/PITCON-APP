import {
  Building2,
  Car,
  Clapperboard,
  Factory,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Plane,
  Radio,
  Scale,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sprout,
  Truck,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Category accents for startup industries — see the "Category accents"
 * block in app/globals.css. Six hues, assigned deterministically by
 * industry slug (a simple string hash) rather than hand-mapped 1:1, so
 * this doesn't need editing every time an industry is added to the
 * `industries` table. Icons ARE hand-mapped per known slug, since a
 * hash can't guess a meaningful pictogram — `iconForIndustry` falls
 * back to a generic building for anything not in the table (including
 * a startup with no industry set yet).
 *
 * IMPORTANT: the class strings below are written out in full (never
 * built with template-string interpolation) so Tailwind's content
 * scanner can actually find them at build time.
 */

export type IndustryAccentKey =
  | "violet"
  | "amber"
  | "coral"
  | "teal"
  | "blue"
  | "rose";

export type IndustryAccentClasses = {
  /** Solid fill + white foreground — logo badges, top/side accent bars. */
  solidBg: string;
  solidText: string;
  /** Soft tint fill + coloured foreground — chips/pills. */
  softBg: string;
  softText: string;
};

const ACCENT_CLASSES: Record<IndustryAccentKey, IndustryAccentClasses> = {
  violet: {
    solidBg: "bg-accent-violet",
    solidText: "text-white",
    softBg: "bg-accent-violet-soft",
    softText: "text-accent-violet-soft-fg",
  },
  amber: {
    solidBg: "bg-accent-amber",
    solidText: "text-white",
    softBg: "bg-accent-amber-soft",
    softText: "text-accent-amber-soft-fg",
  },
  coral: {
    solidBg: "bg-accent-coral",
    solidText: "text-white",
    softBg: "bg-accent-coral-soft",
    softText: "text-accent-coral-soft-fg",
  },
  teal: {
    solidBg: "bg-accent-teal",
    solidText: "text-white",
    softBg: "bg-accent-teal-soft",
    softText: "text-accent-teal-soft-fg",
  },
  blue: {
    solidBg: "bg-accent-blue",
    solidText: "text-white",
    softBg: "bg-accent-blue-soft",
    softText: "text-accent-blue-soft-fg",
  },
  rose: {
    solidBg: "bg-accent-rose",
    solidText: "text-white",
    softBg: "bg-accent-rose-soft",
    softText: "text-accent-rose-soft-fg",
  },
};

const ACCENT_KEYS = Object.keys(ACCENT_CLASSES) as IndustryAccentKey[];

/** Known industry slugs (see the Sprint 2 migration's seed data) mapped
 *  to the icon that best represents them. Anything not listed here
 *  (including a not-yet-chosen industry) falls back to Building2. */
const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  fintech: Landmark,
  healthtech: HeartPulse,
  agritech: Sprout,
  edtech: GraduationCap,
  ecommerce: ShoppingBag,
  logistics: Truck,
  energy: Zap,
  proptech: Home,
  mobility: Car,
  insurtech: ShieldCheck,
  media: Clapperboard,
  manufacturing: Factory,
  telecom: Radio,
  consumer: ShoppingCart,
  traveltech: Plane,
  govtech: Scale,
  other: Building2,
};

/** Simple deterministic string hash (djb2-ish) — same slug always
 *  produces the same accent, no state/storage required. */
function hashSlug(slug: string): number {
  let hash = 5381;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 33) ^ slug.charCodeAt(i);
  }
  return Math.abs(hash);
}

function getIndustryAccentKey(slug: string | null | undefined): IndustryAccentKey {
  if (!slug) return "violet";
  return ACCENT_KEYS[hashSlug(slug) % ACCENT_KEYS.length];
}

/** The single entry point components should use: pass the industry's
 *  slug (or undefined/null for "no industry chosen yet") and get back
 *  the icon + Tailwind classes to render it with. */
export function getIndustryAccent(slug: string | null | undefined): IndustryAccentClasses & {
  icon: LucideIcon;
} {
  const key = getIndustryAccentKey(slug);
  const icon = (slug && INDUSTRY_ICONS[slug]) || Building2;
  return { ...ACCENT_CLASSES[key], icon };
}
