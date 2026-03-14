import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { getStripeServerClient } from '@/lib/stripe/server';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';
import { resolveAllowedAppOrigin } from '@/lib/security/origins';
import { createClient } from '@/lib/supabase/server';

type PriceRow = {
  id: string;
  nickname: string;
  stripe_price_id: string;
};

type CustomerRow = {
  id: string;
  stripe_customer_id: string;
};

function redirectToBilling(
  request: NextRequest,
  key: 'error' | 'message',
  message: string,
) {
  const redirectUrl = new URL('/settings/billing', request.url);
  redirectUrl.searchParams.set(key, message);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

async function resolveRequestedPriceId(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = (await request.json()) as { priceId?: unknown };
    return typeof body.priceId === 'string' ? body.priceId : '';
  }

  const formData = await request.formData();
  const priceId = formData.get('priceId');
  return typeof priceId === 'string' ? priceId : '';
}

async function resolveOrCreateCustomer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  organizationName: string,
) {
  const existingCustomer = await supabase
    .from('customers')
    .select('id, stripe_customer_id')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (existingCustomer.data?.stripe_customer_id) {
    return existingCustomer.data.stripe_customer_id;
  }

  const stripe = getStripeServerClient();
  const createdCustomer = await stripe.customers.create({
    name: organizationName,
    metadata: {
      organization_id: organizationId,
    },
  });

  const insertResult = await supabase.from('customers').insert({
    organization_id: organizationId,
    stripe_customer_id: createdCustomer.id,
  });

  if (!insertResult.error) {
    return createdCustomer.id;
  }

  const raceRecovery = await supabase
    .from('customers')
    .select('id, stripe_customer_id')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if ((raceRecovery.data as CustomerRow | null)?.stripe_customer_id) {
    return (raceRecovery.data as CustomerRow).stripe_customer_id;
  }

  throw new Error(insertResult.error.message);
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
      'Only the organization owner can change billing plans.',
    );
  }

  const requestedPriceId = await resolveRequestedPriceId(request);
  if (!requestedPriceId) {
    return redirectToBilling(request, 'error', 'Select a valid billing plan.');
  }

  const supabase = await createClient();
  const { data: priceRow } = await supabase
    .from('prices')
    .select('id, nickname, stripe_price_id')
    .eq('id', requestedPriceId)
    .eq('is_active', true)
    .maybeSingle();

  if (!priceRow) {
    return redirectToBilling(
      request,
      'error',
      'The selected plan is not available for checkout.',
    );
  }

  try {
    const stripeCustomerId = await resolveOrCreateCustomer(
      supabase,
      context.organization.organizationId,
      context.organization.organizationName,
    );
    const stripe = getStripeServerClient();
    const appOrigin = resolveAllowedAppOrigin(request.headers);
    const successUrl = new URL('/settings/billing', appOrigin);
    successUrl.searchParams.set(
      'message',
      `Checkout opened for ${priceRow.nickname}.`,
    );

    const cancelUrl = new URL('/settings/billing', appOrigin);
    cancelUrl.searchParams.set('error', 'Checkout was canceled.');

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      allow_promotion_codes: true,
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      line_items: [
        {
          price: (priceRow as PriceRow).stripe_price_id,
          quantity: 1,
        },
      ],
      metadata: {
        organization_id: context.organization.organizationId,
        initiated_by_user_id: context.user.id,
      },
    });

    if (!checkoutSession.url) {
      throw new Error('Stripe checkout URL was not returned.');
    }

    logRequestResponse(requestLog, {
      status: 303,
      message: 'Stripe checkout session created.',
      metadata: {
        organization_id: context.organization.organizationId,
        price_id: priceRow.id,
      },
    });

    return NextResponse.redirect(checkoutSession.url, { status: 303 });
  } catch (error) {
    logRequestResponse(requestLog, {
      status: 500,
      level: 'error',
      message: 'Stripe checkout session failed.',
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
        : 'Unable to open Stripe checkout right now.',
    );
  }
}
