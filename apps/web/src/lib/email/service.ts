import { AutoresponderEmailProvider } from '@/lib/email/providers/autoresponder'
import { SesEmailProvider } from '@/lib/email/providers/ses'
import type { EmailProvider } from '@/lib/email/types'

type ProviderKey = 'autoresponder' | 'ses'

function resolveProviderKey(): ProviderKey {
  const configured = (process.env.EMAIL_PROVIDER || '').trim().toLowerCase()
  if (configured === 'ses' || configured === 'autoresponder') {
    return configured
  }

  if (configured === 'sendshark') {
    console.warn(
      '[Email] EMAIL_PROVIDER=sendshark is deprecated. Falling back to built-in autoresponder.'
    )
    return 'autoresponder'
  }

  return 'autoresponder'
}

function createEmailProvider(): EmailProvider {
  const providerKey = resolveProviderKey()

  if (providerKey === 'ses') {
    return new SesEmailProvider()
  }

  return new AutoresponderEmailProvider()
}

export const emailProviderName = resolveProviderKey()
export const emailService = createEmailProvider()

export async function runEmailAutoresponderQueue(limit?: number) {
  if (emailService instanceof AutoresponderEmailProvider) {
    return emailService.runDueJobs(limit)
  }

  return {
    processed: 0,
    sent: 0,
    failed: 0,
  }
}
