import { supabase } from "@/lib/supabase";

export async function saveFunnelType(type: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return;

  await supabase
    .from("users")
    .update({
      funnel_type: type,
      onboarding_step: 3
    })
    .eq("id", user.user.id);
}
