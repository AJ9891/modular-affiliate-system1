'use client';

import { createContext, useContext } from 'react';
import { BrandPersonality } from '@/lib/ai-generator';

const PersonalityContext = createContext<BrandPersonality | null>(null);

export function PersonalityProvider({
  personality,
  children,
}: {
  personality: BrandPersonality;
  children: React.ReactNode;
}) {
  return (
    <PersonalityContext.Provider value={personality}>
      <div
        data-brand={personality.id}
        style={{ '--accent': personality.visuals.accentColor } as React.CSSProperties}
        className="min-h-screen"
      >
        {children}
      </div>
    </PersonalityContext.Provider>
  );
}

export function usePersonality() {
  const ctx = useContext(PersonalityContext);
  if (!ctx) {
    throw new Error('usePersonality must be used inside PersonalityProvider');
  }
  return ctx;
}
