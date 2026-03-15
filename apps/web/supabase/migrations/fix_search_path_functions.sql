-- Set explicit search_path to avoid role-mutable search paths on functions
ALTER FUNCTION public.prevent_system_brand_mode_changes() SET search_path = public, pg_temp;
ALTER FUNCTION public.generate_conversation_title() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_admin_to_agency() SET search_path = public, pg_temp;
ALTER FUNCTION public.refresh_funnel_analytics() SET search_path = public, pg_temp;
ALTER FUNCTION public.has_team_access() SET search_path = public, pg_temp;
ALTER FUNCTION public.log_team_activity() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.current_auth_uid() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_conversation_timestamp() SET search_path = public, pg_temp;
