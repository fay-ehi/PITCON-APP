"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getMessagesPage } from "@/lib/queries/messages";
import { messageContentSchema } from "@/lib/validations/message";
import type { MessageSummary } from "@/types/message";

export type SendMessageResult =
  | { success: false; error: string }
  | { success: true; message: MessageSummary };

/**
 * Sends one message into an existing conversation - Sprint 7's core
 * mutation. Deliberately takes only `conversationId` + raw `content`:
 * `sender_id` is always the signed-in user, never client-supplied (same
 * "the relationship isn't client input" reasoning as
 * `expressInterestAction`). RLS ("Participants can send conversation
 * messages" in the Sprint 7 migration) is the real backstop for "only a
 * participant of this conversation can post into it" - the insert itself
 * is the access check, there's no separate membership lookup here to
 * duplicate it. A signed-in user who isn't a participant simply gets the
 * generic "couldn't be sent" error below, the same as any other failure.
 */
export async function sendMessageAction(
  conversationId: string,
  rawContent: string,
): Promise<SendMessageResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const parsed = messageContentSchema.safeParse(rawContent);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Enter a message.",
    };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: parsed.data,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: "Message couldn't be sent. Try again." };
  }

  // Both workspaces' conversation lists (last message preview/ordering)
  // read through the same revalidation as the rest of the app - a second
  // tab, or the other participant's next visit, sees the update this way.
  // The sender's own open thread updates immediately from this action's
  // own return value instead (see ConversationThread), not from this.
  revalidatePath("/founder/messages");
  revalidatePath("/investor/messages");

  return {
    success: true,
    message: {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      content: data.content,
      createdAt: data.created_at,
    },
  };
}

export type MarkConversationReadResult =
  { success: false; error: string } | { success: true };

/**
 * Clears the signed-in user's own unread flag on one conversation - the
 * conversation-level read state the brief calls for ("conversation-level
 * unread/read state is sufficient" - no per-message read receipts).
 * Fetches the conversation first (through the caller's own RLS-scoped
 * read) to determine which of the two unread columns is theirs to clear,
 * same "fetch, then act on what you found" shape as
 * `respondToInterestAction`. If the signed-in user isn't actually a
 * participant, the fetch itself returns nothing and this fails exactly
 * like a nonexistent conversation id - never confirming a conversation
 * exists to someone who isn't part of it.
 */
export async function markConversationReadAction(
  conversationId: string,
): Promise<MarkConversationReadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const { data: conversation, error: fetchError } = await supabase
    .from("conversations")
    .select("id, investor_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (fetchError || !conversation) {
    return { success: false, error: "Couldn't find that conversation." };
  }

  const isInvestor = conversation.investor_id === user.id;

  const { error: updateError } = await supabase
    .from("conversations")
    .update(isInvestor ? { investor_unread: false } : { founder_unread: false })
    .eq("id", conversationId);

  if (updateError) {
    return { success: false, error: "Couldn't update this conversation." };
  }

  revalidatePath("/founder/messages");
  revalidatePath("/investor/messages");

  return { success: true };
}

export type LoadEarlierMessagesResult =
  | { success: false; error: string }
  | { success: true; messages: MessageSummary[]; hasMore: boolean };

/**
 * Client-triggered "Load earlier messages" (see the brief's
 * "PERFORMANCE"/cursor-loading requirement). Lives here rather than in
 * lib/queries/messages.ts because, unlike the rest of lib/queries, it's
 * called directly from `ConversationThread` (a Client Component) instead
 * of read during a Server Component render, so it needs the same
 * "use server" boundary as the mutations above even though it doesn't
 * write anything - `getMessagesPage` (RLS-scoped, same as every other
 * query) does the actual work.
 */
export async function loadEarlierMessagesAction(
  conversationId: string,
  beforeCursor: string,
): Promise<LoadEarlierMessagesResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  try {
    const page = await getMessagesPage(conversationId, beforeCursor);
    return { success: true, ...page };
  } catch {
    return { success: false, error: "Couldn't load earlier messages." };
  }
}
