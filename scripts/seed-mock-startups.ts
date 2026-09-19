/**
 * Seed script: creates a handful of mock, fully-published startups for
 * demo/launch purposes.
 *
 * WHY THIS EXISTS
 * `startups.founder_id` is a foreign key to `founder_profiles.id`, which is
 * itself 1:1 with `auth.users.id` (see the Sprint 1 + Sprint 3 migrations).
 * There is no way to create a valid startup row without a real auth user
 * behind it - so this script creates one throwaway founder account per mock
 * startup via the Supabase Admin API (which fires `handle_new_user()` and
 * auto-creates the matching `profiles` + `founder_profiles` rows), then
 * inserts the startup itself using the service-role client, which bypasses
 * RLS.
 *
 * USAGE
 *   npm install -D tsx dotenv   (one-time)
 *   npx tsx scripts/seed-mock-startups.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local
 * (same variables lib/supabase/admin.ts uses). NEVER run this against a
 * production project - it creates real auth users.
 *
 * CAVEATS
 * - `logo_url` points at a placeholder image service, not real Supabase
 *   Storage objects - swap in real uploads later if you need the actual
 *   upload path exercised.
 * - `pitch_deck_path` is a fake path. It satisfies the publish-completeness
 *   constraint but there is no real file behind it, so generating a signed
 *   URL / downloading the deck for these mock startups will fail. If you
 *   need a working deck, upload a real PDF for at least one mock founder
 *   through the app itself.
 * - Re-running this script creates a brand-new set of founders/startups
 *   each time (it doesn't check for existing mock data first). Use
 *   `npx tsx scripts/delete-mock-startups.ts` (see bottom of this file for
 *   the one-off query) or filter by the `mock+` email prefix to clean up.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

import type { Database } from "../types/database.types";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY - check .env.local.",
  );
}

const admin = createClient<Database>(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Each entry maps to one throwaway founder account + one published startup.
// industry/stage are matched by slug against the Sprint 2 taxonomy tables.
const MOCK_STARTUPS = [
  {
    founderName: "Amaka Nwosu",
    name: "Kobo Ledger",
    tagline: "Bookkeeping and invoicing built for Nigerian market traders",
    description:
      "Kobo Ledger helps small traders and market vendors track daily sales, manage supplier credit, and generate the simple financial statements banks and cooperatives ask for before extending a loan. Built for low-bandwidth, offline-first use.",
    elevatorPitch:
      "QuickBooks is too complex and too expensive for a market trader doing 20 transactions a day in cash and bank transfers. We give them the 10% of bookkeeping that actually matters, in Pidgin and English, on any Android phone.",
    industrySlug: "fintech",
    stageSlug: "seed",
    country: "Nigeria",
    city: "Lagos",
    fundingAmountSought: 250_000,
    annualRevenue: 48_000,
    monthlyRevenue: 5_000,
    customerCount: 3_200,
    employeeCount: 9,
    websiteUrl: "https://example.com/kobo-ledger",
  },
  {
    founderName: "Tunde Bakare",
    name: "FarmLink",
    tagline: "Connecting smallholder farmers directly to bulk buyers",
    description:
      "FarmLink cuts out three layers of middlemen between smallholder farmers and food processors/exporters, using aggregation hubs and a simple SMS-based ordering system so farmers get paid within 48 hours instead of 6-8 weeks.",
    elevatorPitch:
      "Farmers lose 30-40% of their margin to middlemen because they have no direct line to buyers. We're the direct line, plus the logistics and the cash flow.",
    industrySlug: "agritech",
    stageSlug: "pre-seed",
    country: "Nigeria",
    city: "Ibadan",
    fundingAmountSought: 150_000,
    annualRevenue: null,
    monthlyRevenue: 1_800,
    customerCount: 640,
    employeeCount: 6,
    websiteUrl: "https://example.com/farmlink",
  },
  {
    founderName: "Ngozi Eze",
    name: "Carepoint",
    tagline: "Teleconsultation and pharmacy delivery for underserved towns",
    description:
      "Carepoint pairs a teleconsultation app with a network of licensed community pharmacies, so patients in towns without a resident doctor can get a same-day consultation and have prescriptions delivered within hours.",
    elevatorPitch:
      "Most healthtech in Nigeria targets Lagos and Abuja. We go where the doctor-to-patient ratio is worst - secondary towns with none of the big players.",
    industrySlug: "healthtech",
    stageSlug: "seed",
    country: "Nigeria",
    city: "Enugu",
    fundingAmountSought: 400_000,
    annualRevenue: 62_000,
    monthlyRevenue: 6_500,
    customerCount: 8_900,
    employeeCount: 14,
    websiteUrl: "https://example.com/carepoint",
  },
  {
    founderName: "Chinedu Obi",
    name: "Riderly",
    tagline: "Formalizing okada and keke ride-hailing with driver credit scores",
    description:
      "Riderly brings structure to informal two- and three-wheeler transport: verified drivers, in-app fare payment, and a driver credit score that unlocks vehicle-financing partnerships with local lenders.",
    elevatorPitch:
      "Okada riders move more people daily than any car-hailing app in Nigeria, but they're invisible to lenders and insurers. We make that informal income legible.",
    industrySlug: "mobility",
    stageSlug: "series-a",
    country: "Nigeria",
    city: "Lagos",
    fundingAmountSought: 1_200_000,
    annualRevenue: 310_000,
    monthlyRevenue: 28_000,
    customerCount: 41_000,
    employeeCount: 37,
    websiteUrl: "https://example.com/riderly",
  },
  {
    founderName: "Bola Adeyemi",
    name: "Rentwell",
    tagline: "Verified rentals and rent-financing for Nigerian tenants",
    description:
      "Rentwell lists verified rental listings (real photos, confirmed landlords, no double-listing scams) and offers a rent-financing product that lets tenants pay the huge one- or two-year upfront rent demand in monthly instalments.",
    elevatorPitch:
      "The two biggest pain points in Nigerian renting are scams and the lump-sum upfront payment. We solve both in one product.",
    industrySlug: "proptech",
    stageSlug: "idea",
    country: "Nigeria",
    city: "Abuja",
    fundingAmountSought: 80_000,
    annualRevenue: null,
    monthlyRevenue: null,
    customerCount: 210,
    employeeCount: 3,
    websiteUrl: "https://example.com/rentwell",
  },
];

async function main() {
  const { data: industries, error: industriesError } = await admin
    .from("industries")
    .select("id, slug");
  if (industriesError) throw industriesError;

  const { data: stages, error: stagesError } = await admin
    .from("startup_stages")
    .select("id, slug");
  if (stagesError) throw stagesError;

  const industryIdBySlug = new Map(industries.map((i) => [i.slug, i.id]));
  const stageIdBySlug = new Map(stages.map((s) => [s.slug, s.id]));

  for (const mock of MOCK_STARTUPS) {
    const industryId = industryIdBySlug.get(mock.industrySlug);
    const stageId = stageIdBySlug.get(mock.stageSlug);
    if (!industryId || !stageId) {
      console.error(
        `Skipping "${mock.name}": unknown industry/stage slug (${mock.industrySlug}/${mock.stageSlug}).`,
      );
      continue;
    }

    const email = `mock+${mock.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@pitcon.test`;

    const { data: userData, error: userError } =
      await admin.auth.admin.createUser({
        email,
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: {
          full_name: mock.founderName,
          role: "founder",
        },
      });

    if (userError || !userData.user) {
      console.error(`Failed to create founder for "${mock.name}":`, userError);
      continue;
    }

    const founderId = userData.user.id;

    // Inserted with a placeholder pitch_deck_path first because the real
    // path (per lib/startup/pitch-deck-actions.ts) is
    // `{founder_id}/{startup_id}/{file}` - and we don't have the startup's
    // own id until after the insert.
    const { data: startupRow, error: startupError } = await admin
      .from("startups")
      .insert({
        founder_id: founderId,
        status: "published",
        name: mock.name,
        logo_url: `https://placehold.co/200x200?text=${encodeURIComponent(mock.name[0])}`,
        tagline: mock.tagline,
        description: mock.description,
        elevator_pitch: mock.elevatorPitch,
        industry_id: industryId,
        stage_id: stageId,
        country: mock.country,
        city: mock.city,
        website_url: mock.websiteUrl,
        funding_amount_sought: mock.fundingAmountSought,
        annual_revenue: mock.annualRevenue,
        monthly_revenue: mock.monthlyRevenue,
        customer_count: mock.customerCount,
        employee_count: mock.employeeCount,
        pitch_deck_path: "pending",
        pitch_deck_original_name: "pitch-deck.pdf",
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (startupError || !startupRow) {
      console.error(`Failed to create startup "${mock.name}":`, startupError);
      continue;
    }

    // Now that we know the startup's id, write the real (still fake-file)
    // path in the shape the app expects: {founder_id}/{startup_id}/{file}.
    const { error: pathUpdateError } = await admin
      .from("startups")
      .update({
        pitch_deck_path: `${founderId}/${startupRow.id}/mock-deck.pdf`,
      })
      .eq("id", startupRow.id);

    if (pathUpdateError) {
      console.error(
        `Created "${mock.name}" but failed to set its deck path:`,
        pathUpdateError,
      );
    }

    console.log(
      `✓ Created "${mock.name}" (founder: ${email}, startup id: ${startupRow.id})`,
    );
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// --- Cleanup, when you're ready to remove all mock data -------------------
// Run this as its own script (or paste into a scratch file) once you no
// longer want the mock founders/startups around. Deleting the auth user
// cascades to profiles -> founder_profiles -> startups automatically.
//
//   const { data } = await admin.auth.admin.listUsers();
//   const mockUsers = data.users.filter((u) => u.email?.startsWith("mock+"));
//   for (const u of mockUsers) await admin.auth.admin.deleteUser(u.id);
