import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ success: false, error: 'Missing OAuth code' }, { status: 400 })
  }

  // Placeholder callback for future Google Ads/Search Console OAuth flows.
  return NextResponse.json({
    success: true,
    message: 'Google OAuth callback received. Advanced Google API exchange is not enabled in this MVP.',
    code,
  })
}
