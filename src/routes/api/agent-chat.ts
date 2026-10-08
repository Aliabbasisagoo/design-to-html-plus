import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type UIMessage } from "ai";
import {
  authorizeAgentRequest,
  convertToModelMessages,
  INSTRUCTIONS,
  persistAssistantMessage,
  persistUserMessage,
} from "@/lib/agent/agent.server";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai/run-id.server";

type AgentChatBody = { threadId?: string; messages?: UIMessage[] };

export const Route = createFileRoute("/api/agent-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as AgentChatBody;
        if (!body.threadId || !Array.isArray(body.messages) || body.messages.length === 0) {
          return Response.json({ error: "Invalid conversation request." }, { status: 400 });
        }
        const auth = await authorizeAgentRequest(request, body.threadId);
        if (!auth) return Response.json({ error: "Please sign in to continue." }, { status: 401 });

        const lastMessage = body.messages.at(-1);
        if (!lastMessage || lastMessage.role !== "user") {
          return Response.json({ error: "A student message is required." }, { status: 400 });
        }
        await persistUserMessage(auth.supabase, auth.userId, body.threadId, lastMessage);

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "The admissions agent is not configured." }, { status: 401 });
        const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });

        try {
          const result = streamText({
            model: provider.responses("openai/gpt-6-astra"),
            instructions: INSTRUCTIONS,
            messages: await convertToModelMessages(body.messages),
            abortSignal: request.signal,
            providerOptions: {
              openai: {
                store: false,
                forceReasoning: true,
                reasoningEffort: "low",
                reasoningSummary: "auto",
                include: ["reasoning.encrypted_content"],
              },
            },
          });
          const response = result.toUIMessageStreamResponse({
            originalMessages: body.messages,
            sendReasoning: false,
            onFinish: async ({ responseMessage, isAborted }) => {
              if (!isAborted) {
                await persistAssistantMessage(auth.supabase, auth.userId, body.threadId as string, responseMessage);
              }
            },
          });
          return withLovableAiGatewayRunIdHeader(response, runIdFetch);
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          const message = error instanceof Error ? error.message : "The admissions agent could not reply.";
          if (status === 402 || status === 403 || status === 429) {
            return Response.json({ error: message }, { status });
          }
          console.error(error);
          return Response.json({ error: "The admissions agent could not reply. Please try WhatsApp." }, { status: 500 });
        }
      },
    },
  },
});