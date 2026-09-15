import { describe, expect, it } from "vitest";

import { founderWeeklyDigestEmail } from "@/lib/email/templates/founder-weekly-digest";

const baseInput = {
  fullName: "Ada Lovelace",
  viewCount: 0,
  uniqueInvestorCount: 0,
  newInterestCount: 0,
  incompleteDraftName: null,
  dashboardUrl: "https://pitcon.example/founder/startups",
};

describe("founderWeeklyDigestEmail", () => {
  it("mentions view and investor counts when there were views", () => {
    const { html, text } = founderWeeklyDigestEmail({
      ...baseInput,
      viewCount: 5,
      uniqueInvestorCount: 3,
    });
    expect(html).toContain("5");
    expect(html).toContain("3 investors");
    expect(text).toContain("5");
  });

  it("uses singular phrasing for exactly one view from one investor", () => {
    const { html } = founderWeeklyDigestEmail({
      ...baseInput,
      viewCount: 1,
      uniqueInvestorCount: 1,
    });
    expect(html).toContain("1</strong> profile view");
    expect(html).toContain("1 investor this week");
  });

  it("mentions new interest count when there was interest", () => {
    const { html } = founderWeeklyDigestEmail({ ...baseInput, newInterestCount: 2 });
    expect(html).toContain("2</strong> new investor interests");
  });

  it("leads with the unpublished draft's name when there is one", () => {
    const { html, text } = founderWeeklyDigestEmail({
      ...baseInput,
      incompleteDraftName: "Analytical Engines Inc.",
    });
    expect(html).toContain("Analytical Engines Inc.");
    expect(html).toContain("still a draft");
    expect(text).toContain("Analytical Engines Inc.");
  });

  it("escapes HTML in the founder's name and draft name", () => {
    const { html } = founderWeeklyDigestEmail({
      ...baseInput,
      fullName: "<script>alert(1)</script>",
      incompleteDraftName: "Startup & <Co>",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Startup &amp; &lt;Co&gt;");
  });

  it("links to the founder's dashboard", () => {
    const { html, text } = founderWeeklyDigestEmail({
      ...baseInput,
      viewCount: 1,
    });
    expect(html).toContain("https://pitcon.example/founder/startups");
    expect(text).toContain("https://pitcon.example/founder/startups");
  });
});
