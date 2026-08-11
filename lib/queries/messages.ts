import { createClient } from "@/lib/supabase/server";
import type {
  ConversationDetail,
  ConversationRow,
  ConversationSummary,
  MessageRow,
  MessageSummary,
} from "@/types/message";

/**
 * Server-only data fetchers for Sprint 7 (Messaging). Same convention as
 * lib/queries/interests.ts: RLS (see the Sprint 7 migration) is what
 * actually enforces "an investor only ever sees their own conversations" /
 * "a founder only ever sees conversations for their own startups" - the
 * `founderId`/`investorId` parameters below shape the query, they aren't
 * the access check. Each list fetcher does its own small batch of
 * `.in(...)` lookups rather than a single deep PostgREST embed, matching
 * `getFounderInterests`/`getInvestorInterests`'s reasoning exactly.
 */

/** How many messages one page of `getMessagesPage` returns - the brief's
 * "PERFORMANCE" section explicitly asks for pagination rather than
 * loading a whole conversation's history in one request. */
export const MESSAGE_PAGE_SIZE = 30;

function toConversationStartupSummary(
  row: { id: string; name: string | null; logo_url: string | null } | undefined,
  fallbackId: string,
) {
  return row
    ? { id: row.id, name: row.name, logoUrl: row.logo_url }
    : { id: fallbackId, name: null, logoUrl: null };
}

function toConversationParticipant(
  profile:
    { id: string; full_name: string; avatar_url: string | null } | undefined,
  fallbackId: string,
  fallbackName: string,
) {
  return {
    id: fallbackId,
    fullName: profile?.full_name ?? fallbackName,
    avatarUrl: profile?.avatar_url ?? null,
  };
}

function toMessageSummary(row: MessageRow): MessageSummary {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

/** Most-recent-activity-first, using `last_message_at` where a
 * conversation has one and falling back to `created_at` for a brand new
 * one nobody has messaged in yet - matches the order the conversation
 * list is meant to read in. Not expressible as a single PostgREST
 * `.order()` (see the Sprint 7 migration's `founder_unread`/
 * `investor_unread` comment for the same "no column-to-column
 * expression" limitation), so this sorts the already-fetched, per-user
 * bounded list in JS instead. */
function byRecentActivity(
  a: ConversationSummary,
  b: ConversationSummary,
): number {
  const aTime = new Date(a.lastMessageAt ?? a.createdAt).getTime();
  const bTime = new Date(b.lastMessageAt ?? b.createdAt).getTime();
  return bTime - aTime;
}

/**
 * Every conversation belonging to any startup the signed-in founder owns -
 * backs `/founder/messages`. Resolves each conversation's startup and the
 * investor's profile in two batched lookups, same shape as
 * `getFounderInterests`. An empty array covers both "no startups yet" and
 * "no accepted interests yet" - the caller renders the same empty state
 * either way.
 */
export async function getFounderConversations(
  founderId: string,
): Promise<ConversationSummary[]> {
  const supabase = await createClient();

  const { data: ownStartups, error: startupsError } = await supabase
    .from("startups")
    .select("id, name, logo_url")
    .eq("founder_id", founderId);

  if (startupsError) {
    throw new Error(`Failed to load startups: ${startupsError.message}`);
  }

  const startups = ownStartups ?? [];
  if (startups.length === 0) return [];

  const startupById = new Map(startups.map((row) => [row.id, row]));

  const { data: conversationRows, error: conversationsError } = await supabase
    .from("conversations")
    .select("*")
    .in(
      "startup_id",
      startups.map((s) => s.id),
    );

  if (conversationsError) {
    throw new Error(
      `Failed to load conversations: ${conversationsError.message}`,
    );
  }

  const conversations = conversationRows ?? [];
  if (conversations.length === 0) return [];

  const investorIds = [...new Set(conversations.map((c) => c.investor_id))];
  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", investorIds);

  if (profileError) {
    throw new Error(
      `Failed to load investor profiles: ${profileError.message}`,
    );
  }

  const profileById = new Map((profileRows ?? []).map((row) => [row.id, row]));

  return conversations
    .map((row: ConversationRow): ConversationSummary => ({
      id: row.id,
      startup: toConversationStartupSummary(
        startupById.get(row.startup_id),
        row.startup_id,
      ),
      otherParticipant: toConversationParticipant(
        profileById.get(row.investor_id),
        row.investor_id,
        "Investor",
      ),
      lastMessageAt: row.last_message_at,
      lastMessagePreview: row.last_message_preview,
      lastMessageSenderId: row.last_message_sender_id,
      isUnread: row.founder_unread,
      createdAt: row.created_at,
    }))
    .sort(byRecentActivity);
}

/**
 * Every conversation the signed-in investor is party to - backs
 * `/investor/messages`. Mirrors `getFounderConversations`, just resolving
 * the startup and its owning founder's profile instead.
 */
export async function getInvestorConversations(
  investorId: string,
): Promise<ConversationSummary[]> {
  const supabase = await createClient();

  const { data: conversationRows, error: conversationsError } = await supabase
    .from("conversations")
    .select("*")
    .eq("investor_id", investorId);

  if (conversationsError) {
    throw new Error(
      `Failed to load conversations: ${conversationsError.message}`,
    );
  }

  const conversations = conversationRows ?? [];
  if (conversations.length === 0) return [];

  const startupIds = [...new Set(conversations.map((c) => c.startup_id))];
  const { data: startupRows, error: startupsError } = await supabase
    .from("startups")
    .select("id, name, logo_url, founder_id")
    .in("id", startupIds);

  if (startupsError) {
    throw new Error(`Failed to load startups: ${startupsError.message}`);
  }

  const startups = startupRows ?? [];
  const startupById = new Map(startups.map((row) => [row.id, row]));

  const founderIds = [...new Set(startups.map((s) => s.founder_id))];
  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", founderIds);

  if (profileError) {
    throw new Error(`Failed to load founder profiles: ${profileError.message}`);
  }

  const profileById = new Map((profileRows ?? []).map((row) => [row.id, row]));

  return conversations
    .map((row: ConversationRow): ConversationSummary => {
      const startup = startupById.get(row.startup_id);
      return {
        id: row.id,
        startup: toConversationStartupSummary(startup, row.startup_id),
        otherParticipant: toConversationParticipant(
          startup ? profileById.get(startup.founder_id) : undefined,
          startup?.founder_id ?? "",
          "Founder",
        ),
        lastMessageAt: row.last_message_at,
        lastMessagePreview: row.last_message_preview,
        lastMessageSenderId: row.last_message_sender_id,
        isUnread: row.investor_unread,
        createdAt: row.created_at,
      };
    })
    .sort(byRecentActivity);
}

/** One conversation's header context for the founder side, or `null` if
 * it doesn't exist or doesn't belong to one of `founderId`'s own
 * startups. The explicit ownership check is defense-in-depth alongside
 * RLS, same pattern as `getStartupById` - a founder poking another
 * founder's conversation id gets the same "not found" result as a
 * nonexistent id. */
export async function getFounderConversationDetail(
  conversationId: string,
  founderId: string,
): Promise<ConversationDetail | null> {
  const supabase = await createClient();

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id, startup_id, investor_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError) {
    throw new Error(
      `Failed to load conversation: ${conversationError.message}`,
    );
  }
  if (!conversation) return null;

  const { data: startup, error: startupError } = await supabase
    .from("startups")
    .select("id, name, logo_url, founder_id")
    .eq("id", conversation.startup_id)
    .maybeSingle();

  if (startupError) {
    throw new Error(`Failed to load conversation: ${startupError.message}`);
  }
  if (!startup || startup.founder_id !== founderId) return null;

  const { data: investorProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", conversation.investor_id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Failed to load conversation: ${profileError.message}`);
  }

  return {
    id: conversation.id,
    startup: { id: startup.id, name: startup.name, logoUrl: startup.logo_url },
    otherParticipant: toConversationParticipant(
      investorProfile ?? undefined,
      conversation.investor_id,
      "Investor",
    ),
  };
}

/** One conversation's header context for the investor side, or `null` if
 * it doesn't exist or doesn't belong to `investorId`. Mirrors
 * `getFounderConversationDetail`. */
export async function getInvestorConversationDetail(
  conversationId: string,
  investorId: string,
): Promise<ConversationDetail | null> {
  const supabase = await createClient();

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id, startup_id, investor_id")
    .eq("id", conversationId)
    .eq("investor_id", investorId)
    .maybeSingle();

  if (conversationError) {
    throw new Error(
      `Failed to load conversation: ${conversationError.message}`,
    );
  }
  if (!conversation) return null;

  const { data: startup, error: startupError } = await supabase
    .from("startups")
    .select("id, name, logo_url, founder_id")
    .eq("id", conversation.startup_id)
    .maybeSingle();

  if (startupError) {
    throw new Error(`Failed to load conversation: ${startupError.message}`);
  }

  const { data: founderProfile, error: profileError } = startup
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", startup.founder_id)
        .maybeSingle()
    : { data: null, error: null };

  if (profileError) {
    throw new Error(`Failed to load conversation: ${profileError.message}`);
  }

  return {
    id: conversation.id,
    startup: toConversationStartupSummary(
      startup ?? undefined,
      conversation.startup_id,
    ),
    otherParticipant: toConversationParticipant(
      founderProfile ?? undefined,
      startup?.founder_id ?? "",
      "Founder",
    ),
  };
}

/**
 * One page of a conversation's messages, newest-first at the query level
 * (so `.limit()` + an optional `before` cursor both work off the same
 * index - see `messages_conversation_id_created_at_idx` in the Sprint 7
 * migration), reversed to chronological order for display. Pass `before`
 * (an ISO timestamp, typically the oldest currently-loaded message's
 * `createdAt`) to page further back - see `loadEarlierMessagesAction`.
 * `hasMore` is derived from fetching one extra row rather than a
 * separate count query.
 */
export async function getMessagesPage(
  conversationId: string,
  before?: string,
): Promise<{ messages: MessageSummary[]; hasMore: boolean }> {
  const supabase = await createClient();

  let query = supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(MESSAGE_PAGE_SIZE + 1);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load messages: ${error.message}`);
  }

  const rows = data ?? [];
  const hasMore = rows.length > MESSAGE_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, MESSAGE_PAGE_SIZE) : rows;

  return {
    messages: page.reverse().map(toMessageSummary),
    hasMore,
  };
}

/** How many of the signed-in founder's conversations (across all of
 * their startups) have an unread message - powers the Founder sidebar's
 * Messages badge. Two lightweight `head: true`/`count: "exact"` queries
 * (own startup ids, then unread conversations among them) rather than a
 * full row fetch, same reasoning as `getUnreadNotificationCount`. */
export async function getFounderUnreadConversationCount(
  founderId: string,
): Promise<number> {
  const supabase = await createClient();

  const { data: ownStartups, error: startupsError } = await supabase
    .from("startups")
    .select("id")
    .eq("founder_id", founderId);

  if (startupsError) {
    throw new Error(
      `Failed to load unread message count: ${startupsError.message}`,
    );
  }

  const startupIds = (ownStartups ?? []).map((row) => row.id);
  if (startupIds.length === 0) return 0;

  const { count, error } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .in("startup_id", startupIds)
    .eq("founder_unread", true);

  if (error) {
    throw new Error(`Failed to load unread message count: ${error.message}`);
  }

  return count ?? 0;
}

/** How many of the signed-in investor's conversations have an unread
 * message - powers the Investor top bar's Messages badge. */
export async function getInvestorUnreadConversationCount(
  investorId: string,
): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("investor_id", investorId)
    .eq("investor_unread", true);

  if (error) {
    throw new Error(`Failed to load unread message count: ${error.message}`);
  }

  return count ?? 0;
}
