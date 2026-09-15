import type { Metadata } from "next";

import { getUsersForAdmin } from "@/lib/queries/admin";
import { UsersList } from "@/components/admin/users-list";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Users",
};

/**
 * Sprint 13 (Verified Badges). The admin surface for the one thing this
 * feature needs that a Server Component alone can't do: writing
 * `verified`. A plain GET form for search (`?q=`) rather than a
 * client-side filter - keeps this page a Server Component like the
 * rest of `/admin`, and 50 most-recent-first results is enough to find
 * anyone worth reviewing without needing debounced client search.
 *
 * Not linked from anywhere but the `/admin` dashboard - this isn't a
 * general user-management page (no role changes, no suspension, no
 * editing anyone's profile fields), just the verification queue this
 * one feature needs.
 */
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const users = await getUsersForAdmin(q);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h3 font-semibold text-gray-900">Users</h1>
        <p className="text-small text-gray-500">
          Verify a founder or investor&apos;s identity, or remove a verification made in error.
        </p>
      </div>

      <form className="flex max-w-sm gap-2">
        <Input type="search" name="q" placeholder="Search by name" defaultValue={q ?? ""} />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <UsersList users={users} />
    </div>
  );
}
