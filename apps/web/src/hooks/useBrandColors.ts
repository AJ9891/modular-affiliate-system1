import { useBrandMode } from "@/contexts/BrandModeContext";
import { designTokens } from "@/config/designTokens";

export function useBrandColors() {
  const { mode } = useBrandMode();
  return designTokens.colors[mode];
}
