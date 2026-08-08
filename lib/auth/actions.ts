"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Signs the current user out and returns them to login. Bound directly to
 * a <form action={signOutAction}> so it works with zero client JS. No
 * need for a client component just to fire a click handler.
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
