-- Core DB setup for DataChat Insights
-- 1) Utility function for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2) Profiles table + trigger to populate on signup
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public read, self-manage
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Insert profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dataset_status') THEN
    CREATE TYPE public.dataset_status AS ENUM ('uploaded','processing','ready','failed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_role') THEN
    CREATE TYPE public.message_role AS ENUM ('user','assistant');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dashboard_item_type') THEN
    CREATE TYPE public.dashboard_item_type AS ENUM ('chart','table','kpi');
  END IF;
END $$;

-- 4) Datasets
CREATE TABLE IF NOT EXISTS public.datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text,
  status public.dataset_status NOT NULL DEFAULT 'uploaded',
  row_count integer,
  columns jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own datasets"
ON public.datasets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own datasets"
ON public.datasets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own datasets"
ON public.datasets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets"
ON public.datasets FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_datasets_updated_at ON public.datasets;
CREATE TRIGGER set_datasets_updated_at
BEFORE UPDATE ON public.datasets
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON public.datasets(user_id);

-- 5) Chats
CREATE TABLE IF NOT EXISTS public.chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dataset_id uuid REFERENCES public.datasets(id) ON DELETE SET NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chats"
ON public.chats FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats"
ON public.chats FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
ON public.chats FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
ON public.chats FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_chats_updated_at ON public.chats;
CREATE TRIGGER set_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);

-- 6) Chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  role public.message_role NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own chats"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chats c
    WHERE c.id = chat_messages.chat_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in own chats"
ON public.chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chats c
    WHERE c.id = chat_messages.chat_id AND c.user_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages(chat_id);

-- 7) Dashboards
CREATE TABLE IF NOT EXISTS public.dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dashboards"
ON public.dashboards FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboards"
ON public.dashboards FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboards"
ON public.dashboards FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards"
ON public.dashboards FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_dashboards_updated_at ON public.dashboards;
CREATE TRIGGER set_dashboards_updated_at
BEFORE UPDATE ON public.dashboards
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON public.dashboards(user_id);

-- 8) Dashboard items
CREATE TABLE IF NOT EXISTS public.dashboard_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  item_type public.dashboard_item_type NOT NULL,
  config jsonb NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dashboard_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items in own dashboards"
ON public.dashboard_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dashboards d
    WHERE d.id = dashboard_items.dashboard_id AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert items in own dashboards"
ON public.dashboard_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dashboards d
    WHERE d.id = dashboard_items.dashboard_id AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update items in own dashboards"
ON public.dashboard_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.dashboards d
    WHERE d.id = dashboard_items.dashboard_id AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete items in own dashboards"
ON public.dashboard_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.dashboards d
    WHERE d.id = dashboard_items.dashboard_id AND d.user_id = auth.uid()
  )
);

DROP TRIGGER IF EXISTS set_dashboard_items_updated_at ON public.dashboard_items;
CREATE TRIGGER set_dashboard_items_updated_at
BEFORE UPDATE ON public.dashboard_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_dashboard_items_dashboard_id ON public.dashboard_items(dashboard_id);

-- 9) Storage bucket for datasets
INSERT INTO storage.buckets (id, name, public) VALUES ('datasets', 'datasets', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for user-scoped access in datasets bucket
CREATE POLICY "Users can view their files in datasets"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'datasets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload to datasets in own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'datasets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their files in datasets"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'datasets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their files in datasets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'datasets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
