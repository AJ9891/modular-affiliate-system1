import { FunnelStepType, FUNNEL_FLOW } from "@/config/funnelFlow";
import { useBrandMode } from "@/contexts/BrandModeContext";
import { STEP_COMPONENTS } from "./stepRegistry";
import { ROCKET_FALLBACK_COPY } from "@/lib/brandModes";

export const FunnelStepRenderer = ({ 
  step,
  content 
}: { 
  step: FunnelStepType
  content?: any 
}) => {
  const { mode } = useBrandMode();
  
  const allowedSteps = FUNNEL_FLOW;

  if (!allowedSteps.includes(step)) {
    throw new Error("Invalid funnel structure");
  }
  
  const Component = STEP_COMPONENTS[step][mode];
  
  // Provide fallback content if none is provided
  const defaultContent = step === 'hero' ? ROCKET_FALLBACK_COPY : {};
  
  return <Component content={content || defaultContent} />;
};
