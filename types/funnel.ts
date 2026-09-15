/**
 * Sprint 17 (Product Analytics) - the activation funnel dashboard the
 * README's Roadmap has named as missing since the pre-launch pass.
 * Founder and investor funnels are tracked separately rather than
 * merged into one - they diverge at the third step (a founder
 * activates by publishing; an investor activates by actually browsing)
 * and forcing them into a single shared shape would blur exactly the
 * thing this dashboard exists to show.
 */
export type FunnelStepCounts = {
  signedUp: number;
  /** Founder: has at least one startup with every required-to-publish
   * field filled in (see lib/startup/completion.ts's REQUIRED_FIELDS) -
   * ready to publish, whether or not they've actually clicked publish
   * yet. Investor: has saved organization, investor type, and country
   * - the fields `investorProfileSchema` already requires for the
   * profile save to succeed at all, reused here rather than inventing
   * a separate "investor completion" threshold that exists nowhere
   * else in the app. */
  profileComplete: number;
  /** Founder: has at least one published startup. Investor: has
   * opened at least one startup's full Discover preview (`startup_
   * views`) - a genuine, already-tracked signal standing in for "first
   * search," which isn't logged anywhere as its own event; see
   * getActivationFunnel's own comment. */
  activated: number;
  firstInterest: number;
  /** Sent at least one message - either role, either direction. */
  firstMessage: number;
};

export type ActivationFunnel = {
  founder: FunnelStepCounts;
  investor: FunnelStepCounts;
};
