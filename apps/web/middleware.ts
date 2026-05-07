import { proxy } from './src/proxy'

export const middleware = proxy

// Keep this config declared in the middleware entry file so Next can statically parse it.
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public/).*)',
  ],
}
