import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

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

  const supabase = await createClient();
  const { data: latestPayment } = await supabase
    .from('payment_history')
    .select('stripe_invoice_id, paid_at')
    .eq('organization_id', context.organization.organizationId)
    .order('paid_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestPayment?.stripe_invoice_id) {
    return redirectToBilling(
      request,
      'error',
      'No dummy invoice is available yet. Run a dummy checkout first.',
    );
  }

  return redirectToBilling(
    request,
    'message',
    `Dummy invoice reference: ${latestPayment.stripe_invoice_id}`,
  );
}
