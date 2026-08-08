import { isAuthApiError } from "@supabase/supabase-js";

/**
 * Translates a Supabase Auth error into a short, user-facing message.
 * Never surfaces raw Supabase/Postgres error text (per Sprint 1 §16,
 * "Do not expose raw Supabase/database errors directly to users").
 *
 * Codes are sourced from the installed `@supabase/auth-js` SDK's
 * `ErrorCode` union, not guessed.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (isAuthApiError(error)) {
    switch (error.code) {
      case "invalid_credentials":
        return "Incorrect email or password.";
      case "email_not_confirmed":
        return "Confirm your email address before signing in. Check your inbox for the verification link.";
      case "user_already_exists":
      case "email_exists":
      case "identity_already_exists":
        return "An account with this email already exists. Try logging in instead.";
      case "user_not_found":
        return "We couldn't find an account with that email.";
      case "weak_password":
        return "That password is too weak. Use at least 8 characters, including a letter and a number.";
      case "same_password":
        return "Your new password must be different from your current password.";
      case "user_banned":
        return "This account has been suspended. Contact support for help.";
      case "email_address_invalid":
        return "Enter a valid email address.";
      case "email_address_not_authorized":
        return "This email address can't be used to sign up.";
      case "over_email_send_rate_limit":
        return "Too many emails sent. Wait a few minutes before trying again.";
      case "over_request_rate_limit":
        return "Too many attempts. Wait a moment and try again.";
      case "otp_expired":
        return "This link has expired. Request a new one and try again.";
      case "session_expired":
      case "session_not_found":
      case "refresh_token_not_found":
      case "refresh_token_already_used":
        return "Your session has expired. Sign in again to continue.";
      case "signup_disabled":
      case "email_provider_disabled":
        return "Sign ups are temporarily unavailable. Please try again later.";
      case "validation_failed":
      case "bad_json":
        return "Something about that submission wasn't valid. Check the form and try again.";
      default:
        break;
    }
  }

  // Network failures surface as plain (non-Auth) errors from fetch.
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return "Network error. Check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
}
