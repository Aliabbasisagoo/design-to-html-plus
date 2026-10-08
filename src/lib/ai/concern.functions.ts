import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SERVICES = [
  "Dental Checkup & Consultation",
  "Teeth Cleaning (Scaling & Polishing)",
  "Teeth Whitening",
  "Fillings & Root Canal",
  "Tooth Extraction",
  "Braces & Aligners",
  "Dental Implants",
  "Crowns & Bridges",
  "Kids Dentistry",
  "Emergency Dental Care",
];

const INSTRUCTIONS = `You help prospective patients of Smile Care Dental Clinic (Islamabad) pick a service to book.
You are NOT a dentist and must NEVER diagnose, name a condition as certain, prescribe medication, or give treatment advice.
Choose exactly one service from this list: ${SERVICES.join("; ")}.
If the message mentions severe pain, swelling, bleeding, trauma, a broken tooth or fever, choose "Emergency Dental Care" and advise contacting the clinic right away; for spreading facial swelling or difficulty breathing/swallowing, advise going to a hospital emergency department.
Reply in plain text, under 120 words, exactly in this format:
SERVICE: <service name from the list>
WHY: <one sentence on why this service fits, no diagnosis>
NEXT STEPS:
- <short step>
- <short step>
- <short step>
End with: "This is not a diagnosis — a dentist will examine you at your visit."
If the message is not about teeth or mouth, choose "Dental Checkup & Consultation" and say so politely.`;

export const suggestService = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ concern: z.string().trim().min(5).max(1000) }).parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { error: "The assistant is not configured yet." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const { createLovableAiGatewayRunIdFetch } = await import("./run-id.server");
    const runIdFetch = createLovableAiGatewayRunIdFetch();
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
        messages: [{ role: "user", content: data.concern }],
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
      const text = (await result.text).trim();
      if (!text) return { error: "No suggestion could be made. Please contact the clinic on WhatsApp." };
      const service = SERVICES.find((s) => text.includes(s)) ?? "Dental Checkup & Consultation";
      return { text, service };
    } catch (e) {
      const status = (e as { statusCode?: number })?.statusCode;
      if (status === 429) return { error: "Too many requests right now. Please try again in a minute." };
      if (status === 402) return { error: "The assistant is temporarily unavailable. Please book on WhatsApp." };
      console.error(e);
      return { error: "Something went wrong. Please book directly on WhatsApp." };
    }
  });
