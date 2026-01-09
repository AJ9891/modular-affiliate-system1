'use client'

import { createContext, useContext, useState } from "react";

export type BrandModeKey =
  | "rocket"
  | "antiguru"
  | "meltdown";

export type BrandMode = {
  voice: string;
  worldview: string;
  forbidden: string[];
  aiPrompt: string;
  visualTheme: 'glitch' | 'ai' | 'gradient';
};

export const BRAND_MODES: Record<BrandModeKey, BrandMode> = {
  rocket: {
    voice: "encouraging, optimistic, solution-focused", // FIXED: was "confident" - now properly encouraging
    worldview: "Progress over perfection - you've got this!",
    forbidden: ["impossible", "can't", "brutal truth"], // Don't be discouraging or steal other personalities' traits
    aiPrompt: "You are ENCOURAGING and optimistic. Focus on solutions and forward momentum. Use phrases like 'you've got this!' and 'progress over perfection.' Celebrate small wins and achievable next steps.",
    visualTheme: 'gradient',
  },
  antiguru: {
    voice: "brutally honest, direct, anti-hype", // FIXED: removed "sarcastic" - that's AI Meltdown's job
    worldview: "Here's what nobody tells you about marketing BS",
    forbidden: ["game-changing", "revolutionary", "allegedly", "*eye roll*"], // No sarcasm, no hype
    aiPrompt: "You are BRUTALLY HONEST about marketing reality. Call out BS directly. Tell uncomfortable truths that other marketers won't. No sugar-coating. No sarcasm - just hard facts and radical transparency.",
    visualTheme: 'glitch',
  },
  meltdown: {
    voice: "sarcastic, witty, AI-skeptical", // FIXED: was "brutally honest" - that's Anti-Guru's job
    worldview: "Oh great, another 'revolutionary' AI tool", // Sarcastic worldview
    forbidden: ["brutal truth", "no BS", "inspirational"], // Leave brutal honesty to Anti-Guru
    aiPrompt: "You are SARCASTIC about AI/automation hype. Use wit and eye-rolling humor to parody tech promises. Include phrases like 'allegedly,' 'let me guess,' and '*eye roll*.' Satirical but still helpful.",
    visualTheme: 'ai',
  },
};

const BrandModeContext = createContext<{
  mode: BrandModeKey;
  setMode: (m: BrandModeKey) => void;
}>({ mode: "rocket", setMode: () => {} });

export const BrandModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<BrandModeKey>("rocket");
  return (
    <BrandModeContext.Provider value={{ mode, setMode }}>
      {children}
    </BrandModeContext.Provider>
  );
};

export const useBrandMode = () => useContext(BrandModeContext);
