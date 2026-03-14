import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';
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
      'Only the organization owner can download billing invoices.',
    );
  }

  const supabase = await createClient();
  const { data: latestPayment } = await supabase
    .from('payment_history')
    .select('stripe_invoice_id')
    .eq('organization_id', context.organization.organizationId)
    .not('stripe_invoice_id', 'is', null)
    .order('paid_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const stripeInvoiceId = latestPayment?.stripe_invoice_id;
  if (!stripeInvoiceId) {
    return redirectToBilling(
      request,
      'error',
      'No Stripe invoice is available yet for this organization.',
    );
  }

  try {
    const stripe = getStripeServerClient();
    const invoice = await stripe.invoices.retrieve(stripeInvoiceId);
    const invoiceUrl = invoice.hosted_invoice_url ?? invoice.invoice_pdf;

    if (!invoiceUrl) {
      return redirectToBilling(
        request,
        'error',
        'No downloadable URL was returned for the latest invoice.',
      );
    }

    logRequestResponse(requestLog, {
      status: 303,
      message: 'Redirected to latest Stripe invoice.',
      metadata: {
        organization_id: context.organization.organizationId,
        stripe_invoice_id: stripeInvoiceId,
      },
    });

    return NextResponse.redirect(invoiceUrl, { status: 303 });
  } catch (error) {
    logRequestResponse(requestLog, {
      status: 500,
      level: 'error',
      message: 'Failed to retrieve latest Stripe invoice.',
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
        : 'Unable to load the latest invoice right now.',
    );
  }
}
