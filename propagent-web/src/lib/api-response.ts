import { NextResponse } from 'next/server';

type ErrorBody = {
  ok: false;
  error: string;
  requestId: string;
  details?: unknown;
};

export function getRequestId(req: Request): string {
  return req.headers.get('x-request-id')?.trim() || crypto.randomUUID();
}

export function apiError(
  requestId: string,
  error: string,
  status: number,
  details?: unknown,
): NextResponse<ErrorBody> {
  return NextResponse.json(
    { ok: false, error, requestId, details },
    { status, headers: { 'x-request-id': requestId } },
  );
}

export function apiOk<T>(requestId: string, body: T, status = 200): NextResponse {
  return NextResponse.json(
    { ok: true, requestId, ...body },
    { status, headers: { 'x-request-id': requestId } },
  );
}
