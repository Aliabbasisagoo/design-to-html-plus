CREATE TABLE public.agent_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_threads TO authenticated;
GRANT ALL ON public.agent_threads TO service_role;
ALTER TABLE public.agent_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own agent threads" ON public.agent_threads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own agent threads" ON public.agent_threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agent threads" ON public.agent_threads FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own agent threads" ON public.agent_threads FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX agent_threads_user_updated_idx ON public.agent_threads (user_id, updated_at DESC);

CREATE TABLE public.agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.agent_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  sdk_message_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  parts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_messages TO authenticated;
GRANT ALL ON public.agent_messages TO service_role;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own agent messages" ON public.agent_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own agent messages" ON public.agent_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.agent_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
CREATE POLICY "Users can update own agent messages" ON public.agent_messages FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own agent messages" ON public.agent_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX agent_messages_thread_created_idx ON public.agent_messages (thread_id, created_at ASC);
CREATE UNIQUE INDEX agent_messages_sdk_id_idx ON public.agent_messages (thread_id, sdk_message_id) WHERE sdk_message_id IS NOT NULL;