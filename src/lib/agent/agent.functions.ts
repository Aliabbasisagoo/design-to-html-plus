import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const threadIdSchema = z.object({ threadId: z.string().uuid() });

export const listAgentThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("agent_threads")
      .select("id, title, updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error("Could not load conversations.");
    return data;
  });

export const createAgentThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("agent_threads")
      .insert({ user_id: context.userId })
      .select("id, title, updated_at")
      .single();
    if (error) throw new Error("Could not start a conversation.");
    return data;
  });

export const getAgentThread = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => threadIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: thread, error: threadError } = await context.supabase
      .from("agent_threads")
      .select("id, title, updated_at")
      .eq("id", data.threadId)
      .eq("user_id", context.userId)
      .single();
    if (threadError || !thread) throw new Error("Conversation not found.");

    const { data: rows, error: messagesError } = await context.supabase
      .from("agent_messages")
      .select("sdk_message_id, role, parts")
      .eq("thread_id", data.threadId)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (messagesError) throw new Error("Could not load conversation messages.");

    return {
      thread,
      messages: rows.map((row) => ({
        id: row.sdk_message_id ?? crypto.randomUUID(),
        role: row.role as "user" | "assistant",
        parts: row.parts as Array<{ type: "text"; text: string }>,
      })),
    };
  });

export const deleteAgentThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => threadIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("agent_threads")
      .delete()
      .eq("id", data.threadId)
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not delete the conversation.");
    return { ok: true };
  });