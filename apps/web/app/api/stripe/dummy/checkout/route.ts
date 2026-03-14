import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';
import { createClient } from '@/lib/supabase/server';
import { attachFlash } from '@/lib/flash';

type PriceRow = {
  currency: string;
  id: string;
  nickname: string;
  unit_amount: number;
};

type CustomerRow = {
  stripe_customer_id: string;
};

type SubscriptionRow = {
  id: string;
  stripe_subscription_id: string;
};

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

function buildDummyStripeId(prefix: 'cus' | 'in' | 'sub') {
  const compact = randomUUID().replaceAll('-', '');
  return `${prefix}_dummy_${compact.slice(0, 22)}`;
}

async function ensureDummyCustomer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
) {
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('organization_id', organizationId)
    .maybeSingle();

  const current = (existingCustomer as CustomerRow | null)?.stripe_customer_id;
  if (current) {
    return current;
  }

  const stripeCustomerId = buildDummyStripeId('cus');
  const { error } = await supabase.from('customers').insert({
    organization_id: organizationId,
    stripe_customer_id: stripeCustomerId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return stripeCustomerId;
}

async function upsertDummySubscription(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  customerStripeId: string,
  priceId: string,
) {
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('stripe_customer_id', customerStripeId)
    .maybeSingle();

  if (!customer?.id) {
    throw new Error('Unable to resolve customer for dummy checkout.');
  }

  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('id, stripe_subscription_id')
    .eq('organization_id', organizationId)
    .maybeSingle();

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);
  const stripeSubscriptionId =
    (existingSubscription as SubscriptionRow | null)?.stripe_subscription_id ??
    buildDummyStripeId('sub');

  const { error } = await supabase.from('subscriptions').upsert(
    {
      current_period_end: periodEnd.toISOString(),
      customer_id: customer.id,
      organization_id: organizationId,
      price_id: priceId,
      status: 'active',
      stripe_subscription_id: stripeSubscriptionId,
    },
    { onConflict: 'organization_id' },
  );

  if (error) {
    throw new Error(error.message);
  }

  const { data: refreshedSubscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('organization_id', organizationId)
    .maybeSingle();

  return refreshedSubscription?.id ?? null;
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
      'Only the organization owner can run dummy billing actions.',
    );
  }

  const requestedPriceId = await resolveRequestedPriceId(request);
  if (!requestedPriceId) {
    return redirectToBilling(
      request,
      'error',
      'Select a plan for dummy checkout.',
    );
  }

  const supabase = await createClient();
  const { data: price } = await supabase
    .from('prices')
    .select('id, nickname, currency, unit_amount')
    .eq('id', requestedPriceId)
    .eq('is_active', true)
    .maybeSingle();

  if (!price) {
    return redirectToBilling(
      request,
      'error',
      'The selected plan is not available for dummy checkout.',
    );
  }

  try {
    const customerStripeId = await ensureDummyCustomer(
      supabase,
      context.organization.organizationId,
    );
    const subscriptionId = await upsertDummySubscription(
      supabase,
      context.organization.organizationId,
      customerStripeId,
      price.id,
    );

    const { error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        amount: (price as PriceRow).unit_amount,
        currency: (price as PriceRow).currency,
        organization_id: context.organization.organizationId,
        paid_at: new Date().toISOString(),
        status: 'succeeded',
        stripe_invoice_id: buildDummyStripeId('in'),
        subscription_id: subscriptionId,
      });

    if (paymentError) {
      throw new Error(paymentError.message);
    }

    logRequestResponse(requestLog, {
      status: 303,
      message: 'Dummy checkout completed.',
      metadata: {
        organization_id: context.organization.organizationId,
        price_id: price.id,
      },
    });

    return redirectToBilling(
      request,
      'message',
      `Dummy checkout completed for ${(price as PriceRow).nickname}.`,
    );
  } catch (error) {
    logRequestResponse(requestLog, {
      status: 500,
      level: 'error',
      message: 'Dummy checkout failed.',
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
        : 'Dummy checkout could not be completed.',
    );
  }
}
