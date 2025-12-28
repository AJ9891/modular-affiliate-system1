import { useBrandMode } from "@/contexts/BrandModeContext";
import { RocketHero } from "./heroes/RocketHero";
import { MeltdownHero } from "./heroes/MeltdownHero";
import { AntiGuruHero } from "./heroes/AntiGuruHero";
import { ROCKET_FALLBACK_COPY } from "@/lib/brandModes";

// Fallback content for each brand
const FALLBACK_CONTENT = {
  rocket: ROCKET_FALLBACK_COPY,
  meltdown: {
    headline: "I Can't Believe You're Still Reading This",
    subheadline: "Fine. This is a system for building affiliate funnels. I tested it. It works. Happy now?",
    cta: "Fine, show me",
  },
  antiguru: {
    headline: "No Secrets. No Gurus. Just Systems.",
    subheadline: "If overnight riches worked, you'd already be rich. This is what actually works instead.",
    cta: "See what's different",
  },
};

export const HeroRenderer = () => {
  const { mode } = useBrandMode();

  switch (mode) {
    case "meltdown":
      return <MeltdownHero content={FALLBACK_CONTENT.meltdown} />;
    case "antiguru":
      return <AntiGuruHero content={FALLBACK_CONTENT.antiguru} />;
    default:
      return <RocketHero content={FALLBACK_CONTENT.rocket} />;
  }
};
