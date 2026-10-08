import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LogIn, Menu, MessageCircle, Plus, Trash2, X } from "lucide-react";
import agentMark from "@/assets/hi-tech-agent.png";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import {
  createAgentThread,
  deleteAgentThread,
  getAgentThread,
  listAgentThreads,
} from "@/lib/agent/agent.functions";

type Thread = { id: string; title: string; updated_at: string };

export function AgentWidget({ routeThreadId }: { routeThreadId?: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(Boolean(routeThreadId));
  const [sessionReady, setSessionReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadId, setThreadId] = useState(routeThreadId ?? "");
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session));
      setSessionReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      setSessionReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!signedIn || !open) return;
    void loadThreads(routeThreadId);
  }, [signedIn, open, routeThreadId]);

  async function loadThreads(preferredId?: string) {
    try {
      const rows = await listAgentThreads();
      setThreads(rows);
      const target = preferredId ?? threadId ?? rows[0]?.id;
      if (target) await selectThread(target, false);
      else await newThread();
    } catch {
      setAuthError("Please sign in again to load your conversations.");
    }
  }

  async function selectThread(id: string, shouldNavigate = true) {
    setLoadingThread(true);
    try {
      const data = await getAgentThread({ data: { threadId: id } });
      setThreadId(id);
      setInitialMessages(data.messages);
      setMenuOpen(false);
      if (shouldNavigate) void navigate({ to: "/chat/$threadId", params: { threadId: id } });
    } finally {
      setLoadingThread(false);
    }
  }

  async function newThread() {
    const thread = await createAgentThread();
    setThreads((current) => [thread, ...current]);
    setThreadId(thread.id);
    setInitialMessages([]);
    setMenuOpen(false);
    void navigate({ to: "/chat/$threadId", params: { threadId: thread.id } });
  }

  async function removeThread(id: string) {
    await deleteAgentThread({ data: { threadId: id } });
    const remaining = threads.filter((thread) => thread.id !== id);
    setThreads(remaining);
    if (id === threadId) {
      if (remaining[0]) await selectThread(remaining[0].id);
      else await newThread();
    }
  }

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    const result = authMode === "sign-in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setAuthBusy(false);
    if (result.error) setAuthError(result.error.message);
    else if (authMode === "sign-up" && !result.data.session) {
      setAuthError("Check your email to confirm your account, then sign in.");
      setAuthMode("sign-in");
    }
  }

  async function signInWithGoogle() {
    setAuthBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    setAuthBusy(false);
    if (result.error) setAuthError(result.error.message);
  }

  return (
    <>
      {open && (
        <aside className="fixed inset-x-3 bottom-3 z-[70] flex h-[min(700px,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[410px]" aria-label="Hi Tech Academy admissions agent">
          <div className="flex h-16 shrink-0 items-center gap-3 border-b bg-card px-3">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} aria-label="Conversation menu"><Menu /></Button>
            <img src={agentMark} alt="Hi Tech Academy assistant" width={40} height={40} className="size-10 rounded-full border bg-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">Hi Tech Academy</p>
              <p className="text-xs text-muted-foreground">Admissions assistant</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close assistant"><X /></Button>
          </div>

          {menuOpen && signedIn && (
            <div className="absolute inset-x-0 top-16 z-10 max-h-[60%] overflow-y-auto border-b bg-popover p-3 shadow-lg">
              <Button className="w-full" onClick={() => void newThread()}><Plus /> New conversation</Button>
              <div className="mt-3 space-y-1">
                {threads.map((thread) => (
                  <div key={thread.id} className="flex items-center gap-1 rounded-md hover:bg-accent">
                    <Button variant="ghost" className="min-w-0 flex-1 justify-start truncate" onClick={() => void selectThread(thread.id)}>{thread.title}</Button>
                    <Button variant="ghost" size="icon" onClick={() => void removeThread(thread.id)} aria-label={`Delete ${thread.title}`}><Trash2 /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!sessionReady ? <div className="grid flex-1 place-items-center"><Shimmer>Opening assistant…</Shimmer></div> : signedIn && threadId ? (
            <ChatPanel key={threadId} threadId={threadId} initialMessages={initialMessages} loading={loadingThread} onThreadUpdated={() => void loadThreads(threadId)} />
          ) : signedIn ? <div className="grid flex-1 place-items-center"><Shimmer>Starting conversation…</Shimmer></div> : (
            <div className="flex flex-1 flex-col justify-center p-6">
              <div className="mx-auto max-w-xs text-center">
                <img src={agentMark} alt="Hi Tech Academy assistant" width={72} height={72} className="mx-auto size-18 rounded-full border bg-primary" />
                <h2 className="mt-4 text-xl font-semibold">Ask about admissions</h2>
                <p className="mt-2 text-sm text-muted-foreground">Sign in to save separate conversations about courses, fees, timings, and admission.</p>
              </div>
              <form onSubmit={submitAuth} className="mt-6 space-y-3">
                <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="h-11 w-full rounded-md border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="h-11 w-full rounded-md border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                {authError && <p role="alert" className="text-sm text-destructive">{authError}</p>}
                <Button type="submit" className="h-11 w-full" disabled={authBusy}><LogIn /> {authMode === "sign-in" ? "Sign in" : "Create account"}</Button>
              </form>
              <div className="my-3 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
              <Button variant="outline" className="h-11" onClick={() => void signInWithGoogle()} disabled={authBusy}>Continue with Google</Button>
              <Button variant="link" onClick={() => { setAuthMode(authMode === "sign-in" ? "sign-up" : "sign-in"); setAuthError(""); }}>{authMode === "sign-in" ? "Create an account" : "Already have an account? Sign in"}</Button>
            </div>
          )}
        </aside>
      )}
      {!open && (
        <Button className="fixed bottom-5 right-5 z-[70] h-14 rounded-full px-5 shadow-xl" onClick={() => setOpen(true)} aria-label="Open admissions assistant">
          <img src={agentMark} alt="" width={30} height={30} className="size-8 rounded-full" />
          Ask Hi Tech
        </Button>
      )}
    </>
  );
}

function ChatPanel({ threadId, initialMessages, loading, onThreadUpdated }: { threadId: string; initialMessages: UIMessage[]; loading: boolean; onThreadUpdated: () => void }) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [errorText, setErrorText] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/agent-chat",
    prepareSendMessagesRequest: async ({ messages }) => {
      const { data } = await supabase.auth.getSession();
      return {
        body: { threadId, messages },
        headers: data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {},
      };
    },
  }), [threadId]);
  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (error) => { setErrorText(error.message); textareaRef.current?.focus(); },
    onFinish: () => { onThreadUpdated(); textareaRef.current?.focus(); },
  });

  useEffect(() => { textareaRef.current?.focus(); }, [threadId, status]);
  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-0">
        <ConversationContent>
          {messages.length === 0 && !loading && (
            <div className="py-8 text-center">
              <img src={agentMark} alt="Hi Tech Academy assistant" width={64} height={64} className="mx-auto size-16 rounded-full border bg-primary" />
              <h2 className="mt-4 font-semibold">Assalam-o-Alaikum!</h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">Courses, fees, admission, timings, ya location — kis mein madad karoon?</p>
            </div>
          )}
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.parts.map((part, index) => part.type === "text" ? <MessageResponse key={`${message.id}-${index}`}>{part.text}</MessageResponse> : null)}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <div className="flex items-center gap-2 text-sm text-muted-foreground"><MessageCircle className="size-4" /><Shimmer>Thinking…</Shimmer></div>}
          {errorText && <p role="alert" className="text-sm text-destructive">{errorText}</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="shrink-0 border-t bg-card p-3">
        <PromptInput onSubmit={({ text }) => { if (!text.trim() || busy) return; setErrorText(""); void sendMessage({ text }); }}>
          <PromptInputTextarea ref={textareaRef} placeholder="Ask about courses, fees, or admission…" disabled={busy} />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={!busy && loading} onStop={() => void stop()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}