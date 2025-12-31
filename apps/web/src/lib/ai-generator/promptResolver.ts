import { BrandModeId, PromptContext, ResolvedPrompt } from './types';
import { aiMeltdownPrompt } from './brandModes/aiMeltdown';
import { antiGuruPrompt } from './brandModes/antiGuru';
import { rocketFuturePrompt } from './brandModes/rocketFuture';

export function resolvePrompt(
  brandMode: BrandModeId,
  context: PromptContext
): ResolvedPrompt {
  switch (brandMode) {
    case 'ai_meltdown':
      return aiMeltdownPrompt(context);
    case 'anti_guru':
      return antiGuruPrompt(context);
    case 'rocket_future':
      return rocketFuturePrompt(context);
    default: {
      const _exhaustiveCheck: never = brandMode;
      throw new Error(`Unhandled brand mode: ${brandMode}`);
    }
  }
}
