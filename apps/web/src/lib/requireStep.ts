import { supabase } from "@/lib/supabase";

export async function requireStep(minStep: number) {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return false;

  const { data: profile } = await supabase
    .from("users")
    .select("onboarding_step")
    .eq("id", user.user.id)
    .single();

  return profile?.onboarding_step >= minStep;
}
