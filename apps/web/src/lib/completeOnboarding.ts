import { supabase } from "@/lib/supabase";

export async function completeOnboarding() {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return;

  await supabase
    .from("users")
    .update({
      onboarding_complete: true,
      onboarding_step: 99
    })
    .eq("id", user.user.id);
}
