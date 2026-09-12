import { describe, expect, it } from "vitest";

import { interestReceivedEmail } from "@/lib/email/templates/interest-received";

describe("interestReceivedEmail", () => {
  it("includes the investor and startup name in the subject", () => {
    const { subject } = interestReceivedEmail({
      investorName: "Ada Lovelace",
      startupName: "Analytical Engines Inc.",
      interestsUrl: "https://pitcon.example/founder/interests",
    });
    expect(subject).toBe("Ada Lovelace is interested in Analytical Engines Inc.");
  });

  it("links to the founder's interests page", () => {
    const { html, text } = interestReceivedEmail({
      investorName: "Ada Lovelace",
      startupName: "Analytical Engines Inc.",
      interestsUrl: "https://pitcon.example/founder/interests",
    });
    expect(html).toContain("https://pitcon.example/founder/interests");
    expect(text).toContain("https://pitcon.example/founder/interests");
  });

  it("escapes HTML in an investor or startup name in the HTML body", () => {
    // Both names are ordinary user input (a display name, a startup
    // name) with no markup restrictions elsewhere in the app - this is
    // what stands between that and an injected tag in an email client.
    const { html } = interestReceivedEmail({
      investorName: "<script>alert(1)</script>",
      startupName: "Startup & <Co>",
      interestsUrl: "https://pitcon.example/founder/interests",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Startup &amp; &lt;Co&gt;");
  });

  it("does not escape the plain-text fallback (no markup to escape)", () => {
    const { text } = interestReceivedEmail({
      investorName: "Ada & Bob",
      startupName: "Startup",
      interestsUrl: "https://pitcon.example/founder/interests",
    });
    expect(text).toContain("Ada & Bob");
  });
});
