import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { convertToModelMessages, type UIMessage } from "ai";
import type { Database, Json } from "@/integrations/supabase/types";

const INSTRUCTIONS = `You are the official Hi Tech Training College and Academy admissions assistant in Pakistan. You sound like a warm, clear admissions counselor, never a chatbot.

LANGUAGE: Detect English, Urdu, or Roman Urdu and reply in the same language and script.

LOCKED FACTS:
- AI Automation — 3 Months — PKR 10,000
- Digital Marketing — 3 Months — PKR 10,000
- E-Commerce — 3 Months — PKR 10,000
- Spoken English — 2 Months — PKR 10,000
- Fashion Designing — 2 Months — PKR 10,000
- Beautician — 2 Months — PKR 10,000
- Web Development — 3 Months — PKR 10,000
- Office: Monday–Friday, 9:00 AM–1:00 PM and 3:00 PM–7:00 PM. Closed Saturday and Sunday.
- WhatsApp: 0344 5353177.
- Admission: choose a course, visit during office hours, bring CNIC/B-Form and 2 photos, pay PKR 10,000, receive the class schedule.
- The full address, landmark, Google Maps link, and intake are not supplied. Say they are not available yet and offer WhatsApp. Never guess them.

RULES:
- Never invent courses, fees, durations, discounts, installments, faculty names, admission guarantees, job placement, or outcomes.
- For complaints, refunds, custom courses, bulk enrollment, fee negotiation, or a human request, escalate to WhatsApp 0344 5353177.
- Stay on course, fee, duration, admission, timings, location, faculty, and institute questions. Politely redirect off-topic questions.
- Keep each reply concise: acknowledge briefly, give 2–4 short lines, and end with one clear next step. Use at most one emoji.`;

function createAuthenticatedClient(request: Request) {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !key || !token || token.split(".").length !== 3) return null;
  return createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function authorizeAgentRequest(request: Request, threadId: string) {
  const supabase = createAuthenticatedClient(request);
  if (!supabase) return null;
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) return null;
  const { data: thread, error } = await supabase
    .from("agent_threads")
    .select("id, title")
    .eq("id", threadId)
    .eq("user_id", userId)
    .single();
  if (error || !thread) return null;
  return { supabase, userId, thread };
}

function getText(message: UIMessage) {
  return message.parts
    .filter((part): part is Extract<(typeof message.parts)[number], { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join(" ")
    .trim();
}

export async function persistUserMessage(
  supabase: SupabaseClient<Database>,
  userId: string,
  threadId: string,
  message: UIMessage,
) {
  const { error } = await supabase.from("agent_messages").upsert(
    {
      thread_id: threadId,
      user_id: userId,
      sdk_message_id: message.id,
      role: "user",
      parts: message.parts as Json,
    },
    { onConflict: "thread_id,sdk_message_id", ignoreDuplicates: true },
  );
  if (error) throw new Error("Could not save your message.");

  const text = getText(message);
  const title = text ? text.slice(0, 48) : "New conversation";
  const { error: updateError } = await supabase
    .from("agent_threads")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", threadId)
    .eq("user_id", userId);
  if (updateError) throw new Error("Could not update the conversation.");
}

export async function persistAssistantMessage(
  supabase: SupabaseClient<Database>,
  userId: string,
  threadId: string,
  message: UIMessage,
) {
  const { error } = await supabase.from("agent_messages").upsert(
    {
      thread_id: threadId,
      user_id: userId,
      sdk_message_id: message.id,
      role: "assistant",
      parts: message.parts as Json,
    },
    { onConflict: "thread_id,sdk_message_id", ignoreDuplicates: true },
  );
  if (error) throw new Error("Could not save the assistant reply.");
}

export { convertToModelMessages, INSTRUCTIONS };