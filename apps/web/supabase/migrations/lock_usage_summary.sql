-- Lock down usage_summary to service_role only
REVOKE ALL ON public.usage_summary FROM PUBLIC;
REVOKE ALL ON public.usage_summary FROM anon;
REVOKE ALL ON public.usage_summary FROM authenticated;

GRANT SELECT ON public.usage_summary TO service_role;

-- Keep definer semantics (explicit)
ALTER VIEW public.usage_summary SET (security_invoker = false);
