import { NextResponse } from 'next/server'

export class HttpError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

export class ValidationError extends HttpError {
  issues?: unknown
  constructor(message: string, issues?: unknown, status = 400) {
    super(message, status)
    this.issues = issues
  }
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return await request.json() as T
  } catch (err) {
    throw new ValidationError('Invalid JSON body')
  }
}

export function ok(data: unknown, init?: number | ResponseInit) {
  if (typeof init === 'number') {
    return NextResponse.json(data, { status: init })
  }
  return NextResponse.json(data, init)
}

export function error(err: unknown, fallbackMessage = 'Internal server error') {
  if (err instanceof ValidationError) {
    return NextResponse.json(
      { error: err.message, issues: err.issues },
      { status: err.status }
    )
  }

  if (err instanceof HttpError) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status }
    )
  }

  if (
    err instanceof Error &&
    'status' in err &&
    typeof (err as { status?: unknown }).status === 'number'
  ) {
    return NextResponse.json(
      { error: err.message },
      { status: (err as { status: number }).status }
    )
  }

  const message = err instanceof Error ? err.message : fallbackMessage
  return NextResponse.json({ error: message }, { status: 500 })
}
