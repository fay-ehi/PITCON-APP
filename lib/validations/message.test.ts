import { describe, expect, it } from "vitest";

import { messageContentSchema, MESSAGE_MAX_LENGTH } from "@/lib/validations/message";

describe("messageContentSchema", () => {
  it("accepts an ordinary message", () => {
    const result = messageContentSchema.safeParse("Hey, thanks for reaching out!");
    expect(result.success).toBe(true);
  });

  it("rejects an empty message", () => {
    const result = messageContentSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only message", () => {
    // The brief's "reject empty and whitespace-only messages" - this is
    // the case that requires .trim() before .min(1), not just .min(1)
    // on its own.
    const result = messageContentSchema.safeParse("     \n\t  ");
    expect(result.success).toBe(false);
  });

  it("trims leading/trailing whitespace from an otherwise valid message", () => {
    const result = messageContentSchema.safeParse("  hello there  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("hello there");
    }
  });

  it("accepts a message exactly at the max length", () => {
    const result = messageContentSchema.safeParse("a".repeat(MESSAGE_MAX_LENGTH));
    expect(result.success).toBe(true);
  });

  it("rejects a message one character over the max length", () => {
    const result = messageContentSchema.safeParse("a".repeat(MESSAGE_MAX_LENGTH + 1));
    expect(result.success).toBe(false);
  });
});
