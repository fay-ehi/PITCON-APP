import { afterEach, describe, expect, it } from "vitest";

import { isAdminEmail } from "@/lib/admin/auth";

describe("isAdminEmail", () => {
  const originalValue = process.env.ADMIN_EMAILS;

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalValue;
  });

  it("returns false when ADMIN_EMAILS is unset", () => {
    delete process.env.ADMIN_EMAILS;
    expect(isAdminEmail("founder@example.com")).toBe(false);
  });

  it("returns true for an email on the allowlist", () => {
    process.env.ADMIN_EMAILS = "ops@pitcon.example,cofounder@pitcon.example";
    expect(isAdminEmail("ops@pitcon.example")).toBe(true);
  });

  it("returns false for an email not on the allowlist", () => {
    process.env.ADMIN_EMAILS = "ops@pitcon.example";
    expect(isAdminEmail("someone-else@example.com")).toBe(false);
  });

  it("is case-insensitive", () => {
    process.env.ADMIN_EMAILS = "Ops@Pitcon.example";
    expect(isAdminEmail("ops@pitcon.example")).toBe(true);
  });

  it("tolerates whitespace around entries in the env var", () => {
    process.env.ADMIN_EMAILS = " ops@pitcon.example , cofounder@pitcon.example ";
    expect(isAdminEmail("cofounder@pitcon.example")).toBe(true);
  });

  it("returns false for a null/undefined email", () => {
    process.env.ADMIN_EMAILS = "ops@pitcon.example";
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });
});
