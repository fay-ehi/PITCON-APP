/**
 * Shared HTML shell for every transactional email this app sends -
 * factored out of `supabase/templates/confirmation.html`'s markup so
 * the confirmation/reset-password emails (sent by Supabase Auth
 * directly, not through here) and these Resend-sent ones look like
 * they came from the same product. Table-based layout with inline
 * styles throughout, deliberately - email clients strip <style> blocks
 * and flex/grid unpredictably, so this sticks to what's guaranteed to
 * render everywhere.
 */

export interface EmailButton {
  text: string;
  href: string;
}

export interface EmailShellOptions {
  /** Plain text, no markup - kept simple since every current email is one heading + a short paragraph. */
  heading: string;
  bodyText: string;
  button: EmailButton;
  /** Small print under the button, e.g. who this is about or why they're getting it. */
  footerText: string;
}

/**
 * Escapes a user-controlled string (a startup name, a person's display
 * name, a message preview) before it's interpolated into email HTML.
 * All of the above are ordinary user input with no markup restrictions
 * elsewhere in the app, so treat every one of them as untrusted here.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderEmailShell({ heading, bodyText, button, footerText }: EmailShellOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${heading}</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        Helvetica, Arial, sans-serif;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #fafafa; padding: 32px 16px"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 480px;
              background-color: #ffffff;
              border: 1px solid #e5e5e5;
              border-radius: 14px;
              padding: 40px 32px;
            "
          >
            <tr>
              <td style="padding-bottom: 24px">
                <span style="font-size: 20px; font-weight: 700; color: #171717">
                  Pit<span style="color: #7634c8">con</span>
                </span>
              </td>
            </tr>
            <tr>
              <td
                style="
                  font-size: 20px;
                  font-weight: 600;
                  color: #171717;
                  padding-bottom: 12px;
                "
              >
                ${heading}
              </td>
            </tr>
            <tr>
              <td
                style="
                  font-size: 15px;
                  line-height: 1.6;
                  color: #525252;
                  padding-bottom: 24px;
                "
              >
                ${bodyText}
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 24px">
                <a
                  href="${button.href}"
                  style="
                    display: inline-block;
                    background-color: #7634c8;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                  "
                  >${button.text}</a
                >
              </td>
            </tr>
            <tr>
              <td
                style="
                  font-size: 13px;
                  line-height: 1.5;
                  color: #a3a3a3;
                  padding-bottom: 8px;
                "
              >
                ${footerText}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Plain-text fallback for clients that don't render HTML - every email client sends both parts. */
export function renderEmailText({
  heading,
  bodyText,
  button,
  footerText,
}: EmailShellOptions): string {
  return `${heading}\n\n${bodyText}\n\n${button.text}: ${button.href}\n\n${footerText}`;
}
