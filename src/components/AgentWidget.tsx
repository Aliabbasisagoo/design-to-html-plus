import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, RotateCcw, X } from "lucide-react";
import agentMark from "@/assets/hi-tech-agent.png";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "hitech-agent-chat";

export function AgentWidget({ routeThreadId }: { routeThreadId?: string }) {
  const [open, setOpen] = useState(Boolean(routeThreadId));
  const [ready, setReady] = useState(false);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setInitialMessages(JSON.parse(saved) as UIMessage[]);
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setInitialMessages([]);
    setChatKey((k) => k + 1);
  }

  return (
    <>
      {open && (
        <aside className="fixed inset-x-3 bottom-3 z-[70] flex h-[min(700px,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[410px]" aria-label="Hi Tech Academy admissions agent">
          <div className="flex h-16 shrink-0 items-center gap-3 border-b bg-card px-3">
            <img src={agentMark} alt="Hi Tech Academy assistant" width={40} height={40} className="size-10 rounded-full border bg-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">Hi Tech Academy</p>
              <p className="text-xs text-muted-foreground">Admissions assistant</p>
            </div>
            <Button variant="ghost" size="icon" onClick={reset} aria-label="New conversation"><RotateCcw /></Button>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close assistant"><X /></Button>
          </div>
          {ready ? (
            <ChatPanel key={chatKey} initialMessages={initialMessages} />
          ) : (
            <div className="grid flex-1 place-items-center"><Shimmer>Opening assistant…</Shimmer></div>
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

function ChatPanel({ initialMessages }: { initialMessages: UIMessage[] }) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [errorText, setErrorText] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/agent-chat" }), []);
  const { messages, sendMessage, status, stop } = useChat({
    messages: initialMessages,
    transport,
    onError: (error) => { setErrorText(error.message); textareaRef.current?.focus(); },
    onFinish: () => { textareaRef.current?.focus(); },
  });

  useEffect(() => {
    if (status === "ready" && messages.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
  }, [messages, status]);
  useEffect(() => { textareaRef.current?.focus(); }, [status]);
  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-0">
        <ConversationContent>
          {messages.length === 0 && (
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
            <PromptInputSubmit status={status} onStop={() => void stop()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
