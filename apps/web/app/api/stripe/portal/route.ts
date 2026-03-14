import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';
import { resolveAllowedAppOrigin } from '@/lib/security/origins';
import { createClient } from '@/lib/supabase/server';
import { getStripeServerClient } from '@/lib/stripe/server';
import { attachFlash } from '@/lib/flash';

function redirectToBilling(
  request: NextRequest,
  key: 'error' | 'message',
  message: string,
) {
  const redirectUrl = new URL('/settings/billing', request.url);
  const response = NextResponse.redirect(redirectUrl, { status: 303 });
  attachFlash(response, { [key]: message });
  return response;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestLog = startRequestLog({
    method: request.method,
    pathname: request.nextUrl.pathname,
    requestId: request.headers.get('x-request-id'),
  });

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
      'Only the organization owner can open the billing portal.',
    );
  }

  const supabase = await createClient();
  const { data: customerRow } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('organization_id', context.organization.organizationId)
    .maybeSingle();

  if (!customerRow?.stripe_customer_id) {
    return redirectToBilling(
      request,
      'error',
      'No Stripe customer is linked to this organization yet.',
    );
  }

  try {
    const stripe = getStripeServerClient();
    const returnUrl = new URL(
      '/settings/billing',
      resolveAllowedAppOrigin(request.headers),
    );

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerRow.stripe_customer_id,
      return_url: returnUrl.toString(),
    });

    logRequestResponse(requestLog, {
      status: 303,
      message: 'Stripe billing portal session created.',
      metadata: {
        organization_id: context.organization.organizationId,
      },
    });

    return NextResponse.redirect(portalSession.url, { status: 303 });
  } catch (error) {
    logRequestResponse(requestLog, {
      status: 500,
      level: 'error',
      message: 'Stripe billing portal session failed.',
      metadata: {
        organization_id: context.organization.organizationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return redirectToBilling(
      request,
      'error',
      error instanceof Error
        ? error.message
        : 'Unable to open the Stripe billing portal.',
    );
  }
}
