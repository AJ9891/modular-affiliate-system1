import { BrandModeId, BrandPersonality } from './types';
import { aiMeltdown } from './personalities/aiMeltdown';
import { antiGuru } from './personalities/antiGuru';
import { rocketFuture } from './personalities/rocketFuture';

export function getBrandPersonality(
  brandMode: BrandModeId
): BrandPersonality {
  switch (brandMode) {
    case 'ai_meltdown':
      return aiMeltdown;
    case 'anti_guru':
      return antiGuru;
    case 'rocket_future':
      return rocketFuture;
    default: {
      const _exhaustiveCheck: never = brandMode;
      throw new Error(`Unhandled brand mode: ${brandMode}`);
    }
  }
}
