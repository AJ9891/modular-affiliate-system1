'use client';

import { createContext, useContext } from 'react';
import type { PersonalityProfile } from '@/lib/personality/types';

const PersonalityContext = createContext<PersonalityProfile | null>(null);

export function PersonalityProvider({
  personality,
  children,
}: {
  personality: PersonalityProfile;
  children: React.ReactNode;
}) {
  return (
    <PersonalityContext.Provider value={personality}>
      <div
        data-brand={personality.mode}
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
