import type { Database } from "@/types/database.types";

export type ConversationRow =
  Database["public"]["Tables"]["conversations"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

/**
 * The startup fields shown alongside a conversation - the brief's
 * "CONVERSATION LIST"/"STARTUP CONTEXT" sections are explicit that the
 * startup must stay visible throughout ("Do not display only 'Jane Doe'"),
 * so every summary/detail type below carries this rather than just an id.
 * Deliberately smaller than `InterestStartupSummary` (no industry/stage) -
 * messaging only needs enough to identify which startup this is.
 */
export type ConversationStartupSummary = {
  id: string;
  name: string | null;
  logoUrl: string | null;
};

/** The other participant in a conversation, from the signed-in user's own
 * point of view - a Founder viewing sees the Investor, and vice versa. */
export type ConversationParticipant = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
};

/** One row in either workspace's conversation list - see
 * `getFounderConversations`/`getInvestorConversations` in
 * lib/queries/messages.ts. `isUnread` is already resolved to the
 * signed-in user's own role (`founder_unread` or `investor_unread`,
 * whichever applies) so list/badge rendering never needs to know which
 * column that came from. */
export type ConversationSummary = {
  id: string;
  startup: ConversationStartupSummary;
  otherParticipant: ConversationParticipant;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageSenderId: string | null;
  isUnread: boolean;
  createdAt: string;
};

/** The active conversation's header context - see
 * `getFounderConversationDetail`/`getInvestorConversationDetail`. */
export type ConversationDetail = {
  id: string;
  startup: ConversationStartupSummary;
  otherParticipant: ConversationParticipant;
};

/** One message in an open conversation. */
export type MessageSummary = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
};
