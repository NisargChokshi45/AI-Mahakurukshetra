import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';

function redirectToBilling(
  request: NextRequest,
  key: 'error' | 'message',
  message: string,
) {
  const redirectUrl = new URL('/settings/billing', request.url);
  redirectUrl.searchParams.set(key, message);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const context = await getAuthContext();
  if (!context) {
    return NextResponse.redirect(new URL('/login', request.url), {
      status: 303,
    });
  }

  if (!context.organization) {
    return NextResponse.redirect(new URL('/setup/organization', request.url), {
      status: 303,
    });
  }

  if (context.organization.role !== 'owner') {
    return redirectToBilling(
      request,
      'error',
      'Only the organization owner can run dummy billing actions.',
    );
  }

  return redirectToBilling(
    request,
    'message',
    'Dummy billing portal opened. No external Stripe redirect was needed.',
  );
}
