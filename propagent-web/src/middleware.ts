import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_API_PREFIXES = ['/api/payfast/initiate', '/api/email/notification'];

function hasBearerAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization') || '';
  return authHeader.startsWith('Bearer ');
}

export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  const requestId = requestHeaders.get('x-request-id')?.trim() || crypto.randomUUID();
  requestHeaders.set('x-request-id', requestId);

  const path = req.nextUrl.pathname;
  const isProtectedApi = PROTECTED_API_PREFIXES.some((prefix) => path.startsWith(prefix));

  if (isProtectedApi && !hasBearerAuth(req)) {
    const unauthorized = NextResponse.json(
      {
        ok: false,
        error: 'unauthenticated',
        requestId,
      },
      { status: 401 },
    );
    unauthorized.headers.set('x-request-id', requestId);
    unauthorized.headers.set('x-content-type-options', 'nosniff');
    unauthorized.headers.set('x-frame-options', 'DENY');
    unauthorized.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
    return unauthorized;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('x-request-id', requestId);
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
