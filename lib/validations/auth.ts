import { z } from "zod";

/**
 * Password policy. Kept in sync with `supabase/config.toml`'s
 * `[auth.email] minimum_password_length` (8) and `password_requirements`
 * ("letters_digits"): if either changes, update both.
 */
export const passwordSchema = z
  .string()
  .min(8, "Must be at least 8 characters.")
  .regex(/[a-zA-Z]/, "Must contain at least one letter.")
  .regex(/[0-9]/, "Must contain at least one number.");

export const roleSchema = z.enum(["founder", "investor"], {
  error: "Choose an account type.",
});
export type Role = z.infer<typeof roleSchema>;

/**
 * Full signup form: the "Create account" step (full name, email, password,
 * confirm password) plus the "Role Selection" step (founder/investor),
 * validated together since both must be present before the account is
 * actually created.
 */
const signUpObjectSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Full name is too long."),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: passwordSchema,
  confirmPassword: z.string(),
  role: roleSchema,
});

const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;
const passwordsMatchRefinement = {
  error: "Passwords don't match.",
  path: ["confirmPassword"] as PropertyKey[],
};

export const signUpSchema = signUpObjectSchema.refine(
  passwordsMatch,
  passwordsMatchRefinement,
);
export type SignUpInput = z.infer<typeof signUpSchema>;

/** Fields collected on the "Create account" step only, validated before
 * advancing to role selection. Picked from the bare object schema. Zod
 * doesn't allow `.pick()` on a schema that already has `.refine()` checks
 * attached, so the password-match check is re-applied here instead of
 * inherited. */
export const signUpAccountDetailsSchema = signUpObjectSchema
  .pick({
    fullName: true,
    email: true,
    password: true,
    confirmPassword: true,
  })
  .refine(passwordsMatch, passwordsMatchRefinement);

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match.",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
