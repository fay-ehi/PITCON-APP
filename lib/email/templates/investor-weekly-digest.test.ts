import { describe, expect, it } from "vitest";

import { investorWeeklyDigestEmail } from "@/lib/email/templates/investor-weekly-digest";

const baseInput = {
  fullName: "Marc Andreessen",
  newStartupCount: 4,
  sampleStartupNames: ["Analytical Engines Inc.", "Difference Co"],
  matchedPreferences: false,
  discoverUrl: "https://pitcon.example/investor/discover",
};

describe("investorWeeklyDigestEmail", () => {
  it("says 'published' when the investor has no saved preferences", () => {
    const { html } = investorWeeklyDigestEmail({ ...baseInput, matchedPreferences: false });
    expect(html).toContain("4</strong> new startups published this week");
  });

  it("says 'matching your preferences' when it does", () => {
    const { html } = investorWeeklyDigestEmail({ ...baseInput, matchedPreferences: true });
    expect(html).toContain("4</strong> new startups matching your preferences this week");
  });

  it("uses singular phrasing for exactly one new startup", () => {
    const { html } = investorWeeklyDigestEmail({
      ...baseInput,
      newStartupCount: 1,
      sampleStartupNames: ["Analytical Engines Inc."],
    });
    expect(html).toContain("1</strong> new startup published");
  });

  it("lists sample startup names when there are any", () => {
    const { html, text } = investorWeeklyDigestEmail(baseInput);
    expect(html).toContain("including Analytical Engines Inc., Difference Co");
    expect(text).toContain("including Analytical Engines Inc., Difference Co");
  });

  it("omits the sample list when there are no names", () => {
    const { html } = investorWeeklyDigestEmail({ ...baseInput, sampleStartupNames: [] });
    expect(html).not.toContain("including");
  });

  it("escapes HTML in the investor's name and a startup name", () => {
    const { html } = investorWeeklyDigestEmail({
      ...baseInput,
      fullName: "<script>alert(1)</script>",
      sampleStartupNames: ["Startup & <Co>"],
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Startup &amp; &lt;Co&gt;");
  });

  it("links to Discover", () => {
    const { html, text } = investorWeeklyDigestEmail(baseInput);
    expect(html).toContain("https://pitcon.example/investor/discover");
    expect(text).toContain("https://pitcon.example/investor/discover");
  });
});
