-- Restrict permissive INSERT policies to service_role only (bypasses RLS intentionally)
-- affiliate_clicks
DROP POLICY IF EXISTS "System can insert affiliate clicks" ON public.affiliate_clicks;
CREATE POLICY "Service insert affiliate clicks"
  ON public.affiliate_clicks
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- clicks
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.clicks;
CREATE POLICY "Service insert clicks"
  ON public.clicks
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- conversions
DROP POLICY IF EXISTS "Anyone can insert conversions" ON public.conversions;
CREATE POLICY "Service insert conversions"
  ON public.conversions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- download_logs
DROP POLICY IF EXISTS "System can insert download logs" ON public.download_logs;
CREATE POLICY "Service insert download logs"
  ON public.download_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- team_activity_log
DROP POLICY IF EXISTS "System can insert activity logs" ON public.team_activity_log;
CREATE POLICY "Service insert activity logs"
  ON public.team_activity_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);
