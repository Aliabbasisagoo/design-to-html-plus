import { createFileRoute } from "@tanstack/react-router";
import { AgentWidget } from "@/components/AgentWidget";

const title = "Admissions Chat | Hi Tech Training College and Academy";
const description = "Saved admissions conversations about Hi Tech Academy courses, fees, timings, and enrollment.";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatThreadPage,
});

function ChatThreadPage() {
  const { threadId } = Route.useParams();
  return (
    <main className="min-h-screen bg-secondary p-6">
      <a href="/" className="text-sm font-medium text-primary underline">Back to website</a>
      <AgentWidget routeThreadId={threadId} />
    </main>
  );
}