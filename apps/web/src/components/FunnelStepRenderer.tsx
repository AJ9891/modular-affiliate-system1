import { FunnelStepType, FUNNEL_FLOW } from "@/config/funnelFlow";
import { useBrandMode } from "@/contexts/BrandModeContext";
import { STEP_COMPONENTS } from "./stepRegistry";

export const FunnelStepRenderer = ({ step }: { step: FunnelStepType }) => {
  const { mode } = useBrandMode();
  
  const allowedSteps = FUNNEL_FLOW;

  if (!allowedSteps.includes(step)) {
    throw new Error("Invalid funnel structure");
  }
  
  const Component = STEP_COMPONENTS[step][mode];
  return <Component />;
};
