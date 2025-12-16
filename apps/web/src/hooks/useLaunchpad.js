// src/hooks/useLaunchpad.js
import { supabase } from "../lib/supabase";

export function useLaunchpad(userId) {
  const getProfile = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  };

  const updateStage = async (stage) => {
    const { error } = await supabase
      .from("users")
      .update({ launchpad_stage: stage })
      .eq("id", userId);

    if (error) throw error;
  };

  return { getProfile, updateStage };
}
