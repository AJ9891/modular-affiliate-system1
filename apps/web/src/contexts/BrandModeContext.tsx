'use client'

import { createContext, useContext, useState } from "react";

export type BrandMode =
  | "rocket"
  | "antiguru"
  | "meltdown";

export const BRAND_MODES = {
  rocket: {
    voice: "confident, optimistic, forward-moving",
    worldview: "Momentum beats motivation",
    forbidden: ["hype", "overnight", "guaranteed"],
  },
  antiguru: {
    voice: "sarcastic, calm, anti-hype",
    worldview: "If it worked like they say, you'd be rich already",
    forbidden: ["guru", "secret", "six figures"],
  },
  meltdown: {
    voice: "reluctant AI, overworked, brutally honest",
    worldview: "I tested this so you don't have to",
    forbidden: ["inspirational", "emotional manipulation"],
  },
};

const BrandModeContext = createContext<{
  mode: BrandMode;
  setMode: (m: BrandMode) => void;
}>({ mode: "rocket", setMode: () => {} });

export const BrandModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<BrandMode>("rocket");
  return (
    <BrandModeContext.Provider value={{ mode, setMode }}>
      {children}
    </BrandModeContext.Provider>
  );
};

export const useBrandMode = () => useContext(BrandModeContext);
