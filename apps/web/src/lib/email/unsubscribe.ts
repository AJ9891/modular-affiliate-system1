import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

export type UnsubscribeRecipient = {
  email: string
  userId: string | null
}

type UnsubscribePayload = UnsubscribeRecipient & { version: 1 }

function getSecret(): string {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('EMAIL_UNSUBSCRIBE_SECRET must be configured with at least 32 characters')
  }
  return secret
}

function getEncryptionKey(): Buffer {
  return createHash('sha256').update(getSecret()).digest()
}

export function createUnsubscribeToken(recipient: UnsubscribeRecipient): string {
  const payload: UnsubscribePayload = {
    version: 1,
    email: recipient.email.trim().toLowerCase(),
    userId: recipient.userId,
  }
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv)
  cipher.setAAD(Buffer.from('launchpad-email-unsubscribe:v1'))
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ])
  return [
    iv.toString('base64url'),
    encrypted.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
  ].join('.')
}

export function verifyUnsubscribeToken(token: string): UnsubscribeRecipient | null {
  const [encodedIv, encodedPayload, encodedTag, ...extra] = token.split('.')
  if (!encodedIv || !encodedPayload || !encodedTag || extra.length > 0 || token.length > 4096) return null
  const key = getEncryptionKey()

  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(encodedIv, 'base64url')
    )
    decipher.setAAD(Buffer.from('launchpad-email-unsubscribe:v1'))
    decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'))
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(encodedPayload, 'base64url')),
      decipher.final(),
    ])
    const payload = JSON.parse(plaintext.toString('utf8')) as Partial<UnsubscribePayload>
    if (
      payload.version !== 1 ||
      typeof payload.email !== 'string' ||
      !payload.email.includes('@') ||
      !(payload.userId === null || typeof payload.userId === 'string')
    ) {
      return null
    }

    return { email: payload.email.toLowerCase(), userId: payload.userId }
  } catch {
    return null
  }
}

export function createUnsubscribeUrl(recipient: UnsubscribeRecipient): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_BASE_URL must be configured for email links')
  }

  const url = new URL('/api/email/unsubscribe', baseUrl)
  url.searchParams.set('token', createUnsubscribeToken(recipient))
  return url.toString()
}
