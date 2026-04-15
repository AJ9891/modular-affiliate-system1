import { SendsharkEmailProvider } from '@/lib/email/providers/sendshark'
import { SesEmailProvider } from '@/lib/email/providers/ses'
import type { EmailProvider } from '@/lib/email/types'

type ProviderKey = 'sendshark' | 'ses'

function resolveProviderKey(): ProviderKey {
  const configured = (process.env.EMAIL_PROVIDER || '').trim().toLowerCase()
  if (configured === 'ses' || configured === 'sendshark') {
    return configured
  }

  const hasSesRegion = !!(process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION)
  const hasStaticSesCredentials =
    !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY

  if (hasSesRegion && hasStaticSesCredentials) {
    return 'ses'
  }

  return 'sendshark'
}

function createEmailProvider(): EmailProvider {
  const providerKey = resolveProviderKey()

  if (providerKey === 'ses') {
    return new SesEmailProvider()
  }

  return new SendsharkEmailProvider()
}

export const emailProviderName = resolveProviderKey()
export const emailService = createEmailProvider()
