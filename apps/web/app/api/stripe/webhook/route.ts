import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getServerEnv } from '@/lib/env';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';
import { getStripeServerClient } from '@/lib/stripe/server';
import {
  mapStripeSubscriptionStatus,
  unixSecondsToIso,
} from '@/lib/stripe/sync';

type CustomerRecord = {
  id: string;
  organization_id: string;
  stripe_customer_id: string;
};

type SubscriptionRecord = {
  id: string;
};

async function resolveCustomerRecord(stripeCustomerId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('customers')
    .select('id, organization_id, stripe_customer_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();

  return (data as CustomerRecord | null) ?? null;
}

async function resolvePriceId(stripePriceId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('prices')
    .select('id')
    .eq('stripe_price_id', stripePriceId)
    .maybeSingle();

  return data?.id ?? null;
}

async function upsertSubscriptionFromStripe(
  customer: CustomerRecord,
  subscription: Stripe.Subscription,
) {
  const admin = createAdminClient();
  const stripePriceId = subscription.items.data[0]?.price?.id ?? null;
  const currentPeriodEnd =
    subscription.items.data[0]?.current_period_end ?? null;
  const priceId = stripePriceId ? await resolvePriceId(stripePriceId) : null;

  const { error } = await admin.from('subscriptions').upsert(
    {
      customer_id: customer.id,
      current_period_end: unixSecondsToIso(currentPeriodEnd),
      organization_id: customer.organization_id,
      price_id: priceId,
      status: mapStripeSubscriptionStatus(subscription.status),
      stripe_subscription_id: subscription.id,
    },
    { onConflict: 'organization_id' },
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const stripeCustomerId =
    typeof subscription.customer === 'string' ? subscription.customer : null;
  if (!stripeCustomerId) {
    return;
  }

  const customer = await resolveCustomerRecord(stripeCustomerId);
  if (!customer) {
    return;
  }

  await upsertSubscriptionFromStripe(customer, subscription);
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.mode !== 'subscription') {
    return;
  }

  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : null;
  const stripeSubscriptionId =
    typeof session.subscription === 'string' ? session.subscription : null;

  if (!stripeCustomerId || !stripeSubscriptionId) {
    return;
  }

  const customer = await resolveCustomerRecord(stripeCustomerId);
  if (!customer) {
    return;
  }

  const stripe = getStripeServerClient();
  const subscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);
  await upsertSubscriptionFromStripe(customer, subscription);
}

async function resolveSubscriptionId(
  organizationId: string,
  stripeSubscriptionId: string | null,
) {
  if (!stripeSubscriptionId) {
    return null;
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from('subscriptions')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .maybeSingle();

  return ((data as SubscriptionRecord | null)?.id ?? null) as string | null;
}

async function upsertPaymentHistoryFromInvoice(
  customer: CustomerRecord,
  invoice: Stripe.Invoice,
  status: 'failed' | 'succeeded',
) {
  const admin = createAdminClient();
  const stripeSubscription =
    invoice.parent?.type === 'subscription_details'
      ? invoice.parent.subscription_details?.subscription
      : null;
  const stripeSubscriptionId =
    typeof stripeSubscription === 'string' ? stripeSubscription : null;
  const subscriptionId = await resolveSubscriptionId(
    customer.organization_id,
    stripeSubscriptionId,
  );

  const paidAtIso =
    unixSecondsToIso(invoice.status_transitions?.paid_at ?? null) ??
    unixSecondsToIso(invoice.created) ??
    new Date().toISOString();

  const amount =
    status === 'succeeded'
      ? (invoice.amount_paid ?? invoice.amount_due ?? 0)
      : (invoice.amount_due ??
        invoice.amount_remaining ??
        invoice.amount_paid ??
        0);

  const { data: existingRow } = await admin
    .from('payment_history')
    .select('id')
    .eq('organization_id', customer.organization_id)
    .eq('stripe_invoice_id', invoice.id)
    .limit(1)
    .maybeSingle();

  if (existingRow?.id) {
    const { error } = await admin
      .from('payment_history')
      .update({
        amount,
        currency: invoice.currency ?? 'usd',
        paid_at: paidAtIso,
        status,
        subscription_id: subscriptionId,
      })
      .eq('id', existingRow.id);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await admin.from('payment_history').insert({
    amount,
    currency: invoice.currency ?? 'usd',
    organization_id: customer.organization_id,
    paid_at: paidAtIso,
    status,
    stripe_invoice_id: invoice.id,
    subscription_id: subscriptionId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function handleInvoiceEvent(
  invoice: Stripe.Invoice,
  status: 'failed' | 'succeeded',
) {
  const stripeCustomerId =
    typeof invoice.customer === 'string' ? invoice.customer : null;
  if (!stripeCustomerId) {
    return;
  }

  const customer = await resolveCustomerRecord(stripeCustomerId);
  if (!customer) {
    return;
  }

  await upsertPaymentHistoryFromInvoice(customer, invoice, status);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestLog = startRequestLog({
    method: request.method,
    pathname: request.nextUrl.pathname,
    requestId: request.headers.get('x-request-id'),
  });

  const env = getServerEnv();
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET is not configured.' },
      { status: 500 },
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header.' },
      { status: 400 },
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripeServerClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    logRequestResponse(requestLog, {
      status: 400,
      level: 'warn',
      message: 'Invalid Stripe webhook signature.',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      { error: 'Invalid webhook signature.' },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await handleInvoiceEvent(event.data.object as Stripe.Invoice, 'failed');
        break;
      case 'invoice.payment_succeeded':
        await handleInvoiceEvent(
          event.data.object as Stripe.Invoice,
          'succeeded',
        );
        break;
      default:
        break;
    }

    const response = NextResponse.json({ received: true }, { status: 200 });
    response.headers.set('x-request-id', requestLog.requestId);

    logRequestResponse(requestLog, {
      status: 200,
      message: 'Stripe webhook handled.',
      metadata: {
        event_type: event.type,
      },
    });

    return response;
  } catch (error) {
    logRequestResponse(requestLog, {
      status: 500,
      level: 'error',
      message: 'Stripe webhook processing failed.',
      metadata: {
        event_type: event.type,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      { error: 'Webhook processing failed.' },
      { status: 500 },
    );
  }
}
