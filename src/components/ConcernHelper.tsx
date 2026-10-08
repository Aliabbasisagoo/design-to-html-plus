import { useState } from "react";
import { suggestService } from "@/lib/ai/concern.functions";

export function ConcernHelper({ wa, btnPrimary }: { wa: (t?: string) => string; btnPrimary: string }) {
  const [concern, setConcern] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<{ text?: string; service?: string; error?: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (concern.trim().length < 5) return;
    setLoading(true);
    setRes(null);
    try {
      setRes(await suggestService({ data: { concern } }));
    } catch {
      setRes({ error: "Something went wrong. Please book directly on WhatsApp." });
    }
    setLoading(false);
  }

  return (
    <section id="helper" className="scroll-mt-16 py-16">
      <div className="mx-auto max-w-2xl px-4">
        <h2 className="text-center text-3xl font-semibold">Not sure which service you need?</h2>
        <p className="mt-3 text-center text-muted-foreground">Describe your concern and we'll suggest a service to book. This is not a diagnosis.</p>
        <form onSubmit={submit} className="mt-8 rounded-xl border bg-card p-6">
          <label htmlFor="concern" className="font-medium">Your concern</label>
          <textarea id="concern" value={concern} onChange={(e) => setConcern(e.target.value)} maxLength={1000} rows={4}
            placeholder="e.g. My back tooth hurts when I drink something cold"
            className="mt-2 w-full rounded-lg border bg-background p-3 text-base focus-visible:outline-2 focus-visible:outline-ring" />
          <button type="submit" disabled={loading || concern.trim().length < 5} className={`${btnPrimary} mt-4 w-full disabled:opacity-50`}>
            {loading ? "Thinking…" : "Suggest a service"}
          </button>
          {res?.error && <p role="alert" className="mt-4 text-destructive">{res.error}</p>}
          {res?.text && (
            <div className="mt-6 rounded-lg bg-accent p-4" aria-live="polite">
              <p className="whitespace-pre-line">{res.text}</p>
              <a href={wa(`Hi, I want to book ${res.service}. My concern: ${concern}`)} target="_blank" rel="noopener" className={`${btnPrimary} mt-4`}>
                Book {res.service} on WhatsApp
              </a>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
