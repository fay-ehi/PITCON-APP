import { describe, expect, it } from "vitest";

import {
  forgotPasswordSchema,
  loginSchema,
  passwordSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/lib/validations/auth";

describe("passwordSchema", () => {
  it("accepts a password with letters and digits at the minimum length", () => {
    expect(passwordSchema.safeParse("abcdef12").success).toBe(true);
  });

  it("rejects a password under 8 characters", () => {
    expect(passwordSchema.safeParse("abc123").success).toBe(false);
  });

  it("rejects a password with no letters", () => {
    expect(passwordSchema.safeParse("12345678").success).toBe(false);
  });

  it("rejects a password with no digits", () => {
    expect(passwordSchema.safeParse("abcdefgh").success).toBe(false);
  });
});

describe("signUpSchema", () => {
  const valid = {
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    password: "abcdef12",
    confirmPassword: "abcdef12",
    role: "founder" as const,
  };

  it("accepts a fully valid signup", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects mismatched passwords, attributing the error to confirmPassword", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      confirmPassword: "different1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("lowercases and trims the email", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      email: "  Ada@Example.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ada@example.com");
    }
  });

  it("rejects an invalid role", () => {
    const result = signUpSchema.safeParse({ ...valid, role: "admin" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "ada@example.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("doesn't enforce the full password policy on login", () => {
    // Login only checks presence, not strength - the policy is enforced
    // at signup/reset time, not on every login of a pre-existing password.
    const result = loginSchema.safeParse({ email: "ada@example.com", password: "x" });
    expect(result.success).toBe(true);
  });
});

describe("forgotPasswordSchema", () => {
  it("rejects a malformed email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "abcdef12",
      confirmPassword: "abcdef13",
    });
    expect(result.success).toBe(false);
  });

  it("accepts matching, policy-compliant passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "abcdef12",
      confirmPassword: "abcdef12",
    });
    expect(result.success).toBe(true);
  });
});
