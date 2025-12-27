import { useBrandMode } from "@/contexts/BrandModeContext";
import { RocketHero } from "./heroes/RocketHero";
import { MeltdownHero } from "./heroes/MeltdownHero";
import { AntiGuruHero } from "./heroes/AntiGuruHero";

export const HeroRenderer = () => {
  const { mode } = useBrandMode();

  switch (mode) {
    case "meltdown":
      return <MeltdownHero />;
    case "antiguru":
      return <AntiGuruHero />;
    default:
      return <RocketHero />;
  }
};
