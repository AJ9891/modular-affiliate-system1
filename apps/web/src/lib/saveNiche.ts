import { supabase } from "@/lib/supabase";

export async function saveNiche(niche: string) {
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return;

  await supabase
    .from("users")
    .update({
      niche,
      onboarding_step: 2
    })
    .eq("id", user.user.id);
}
