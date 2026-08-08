import type { Database } from "@/types/database.types";

/**
 * The two account types PITCON supports in the MVP. Sourced from the
 * generated `user_role` Postgres enum rather than redeclared by hand, so
 * this can never drift from the database constraint.
 */
export type UserRole = Database["public"]["Enums"]["user_role"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
