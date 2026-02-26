
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create their own dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Users can delete their own dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Users can update their own dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Users can view their own dashboards" ON public.dashboards;

-- Recreate as permissive policies
CREATE POLICY "Users can view their own dashboards" ON public.dashboards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own dashboards" ON public.dashboards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dashboards" ON public.dashboards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dashboards" ON public.dashboards FOR DELETE USING (auth.uid() = user_id);
