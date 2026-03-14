import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
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
    .select('stripe_invoice_id, paid_at, amount, currency')
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

  const currency = 'USD';
  const paidAt = latestPayment.paid_at
    ? new Date(latestPayment.paid_at)
    : new Date();
  const dueAt = new Date(paidAt);
  dueAt.setDate(paidAt.getDate() + 14);

  const formatMoney = (amountCents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amountCents / 100);
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
    }).format(date);

  const mockInvoice = {
    number: latestPayment.stripe_invoice_id,
    issuedAt: formatDate(paidAt),
    dueAt: formatDate(dueAt),
    status: 'Paid',
    company: {
      name: 'Apex Resilience, Inc.',
      address: ['120 Mission St', 'Suite 1400', 'San Francisco, CA 94105'],
      email: 'billing@apex-resilience.demo',
      phone: '+1 (415) 555-0134',
      website: 'apex-resilience.demo',
      taxId: 'US EIN 88-7654321',
    },
    billedTo: {
      name: context.organization.organizationName || 'Customer Organization',
      attention: 'Finance Team',
      address: ['251 Market Street', 'Floor 9', 'Philadelphia, PA 19106'],
      email: 'ap@customer-demo.com',
    },
    payment: {
      method: 'Visa •••• 4242',
      txnId: `pm_${latestPayment.stripe_invoice_id}`,
      paidAt: formatDate(paidAt),
    },
    items: [
      {
        description:
          'Enterprise Resilience Platform — Core seat bundle (25 seats)',
        quantity: 1,
        unitPriceCents: 125000,
      },
      {
        description: 'Supplier Risk Monitoring — 500 suppliers',
        quantity: 1,
        unitPriceCents: 48000,
      },
      {
        description: 'Priority onboarding & training',
        quantity: 1,
        unitPriceCents: 12000,
      },
    ],
    taxRate: 0.0825,
    notes: [
      'Thank you for partnering with us. This invoice is a mock preview for demo purposes.',
      'Questions? Reply to billing@apex-resilience.demo.',
    ],
  };

  const subtotalCents = mockInvoice.items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );
  const taxCents = Math.round(subtotalCents * mockInvoice.taxRate);
  const totalCents = subtotalCents + taxCents;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invoice ${mockInvoice.number}</title>
    <style>
      :root {
        color-scheme: light;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        color: #0f172a;
        background: #f8fafc;
        word-break: break-word;
        overflow-wrap: anywhere;
      }
      .page {
        max-width: 860px;
        margin: 32px auto;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        box-shadow: 0 20px 40px -24px rgba(15, 23, 42, 0.25);
        padding: 32px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 999px;
        background: #0f172a;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #f8fafc;
      }
      h1 {
        margin: 12px 0 4px;
        font-size: 28px;
      }
      .muted {
        color: #64748b;
        font-size: 14px;
        margin: 0;
      }
      .details {
        margin-top: 24px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
      }
      .details.split {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }
      .detail-card {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        background: #f8fafc;
      }
      .detail-grid {
        display: grid;
        gap: 12px;
      }
      .detail-cols {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 12px;
      }
      .detail-text {
        font-size: 13px;
        color: #475569;
        line-height: 1.5;
      }
      .detail-meta {
        font-size: 12px;
        color: #94a3b8;
      }
      .detail-card,
      .line-items .row,
      .line-items header,
      .totals .row {
        min-width: 0;
      }
      .detail-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #94a3b8;
        margin-bottom: 8px;
      }
      .detail-value {
        font-size: 16px;
        font-weight: 600;
        color: #0f172a;
      }
      .line-items {
        margin-top: 28px;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
      }
      .line-items header,
      .line-items .row {
        display: grid;
        grid-template-columns: 1fr 90px 120px;
        gap: 12px;
        padding: 12px 16px;
      }
      .line-items header {
        background: #f1f5f9;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
      }
      .line-items .row {
        border-top: 1px solid #e2e8f0;
        font-size: 14px;
      }
      .totals {
        margin-top: 20px;
        display: grid;
        justify-content: end;
        gap: 8px;
      }
      .totals .row {
        display: grid;
        grid-template-columns: 180px 140px;
        gap: 16px;
        font-size: 14px;
      }
      .totals .row.total {
        font-size: 16px;
        font-weight: 700;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        border-radius: 999px;
        background: #ecfdf3;
        color: #065f46;
        font-size: 12px;
        font-weight: 600;
      }
      .meta {
        text-align: right;
      }
      .actions {
        margin-top: 28px;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .button {
        border: none;
        border-radius: 999px;
        padding: 10px 18px;
        font-size: 14px;
        cursor: pointer;
        background: #0f172a;
        color: #ffffff;
      }
      .button.secondary {
        background: #e2e8f0;
        color: #0f172a;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #94a3b8;
      }
      @media print {
        body {
          background: #ffffff;
        }
        .page {
          box-shadow: none;
          border: none;
          margin: 0;
          border-radius: 0;
        }
        .actions {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <div class="header">
        <div>
          <span class="badge">Invoice</span>
          <h1>Invoice Preview</h1>
          <p class="muted">Subscription billing for ${mockInvoice.billedTo.name}</p>
        </div>
        <div class="meta">
          <div class="muted">Invoice #${mockInvoice.number}</div>
          <div class="muted">Issued ${mockInvoice.issuedAt}</div>
          <div class="muted">Due ${mockInvoice.dueAt}</div>
          <div style="margin-top:8px;"><span class="pill">${mockInvoice.status}</span></div>
        </div>
      </div>

      <section class="details split">
        <div class="detail-card">
          <div class="detail-grid">
            <div>
              <div class="detail-label">From</div>
              <div class="detail-value">${mockInvoice.company.name}</div>
              <div class="detail-meta">${mockInvoice.company.taxId}</div>
            </div>
            <div class="detail-cols">
              <div>
                <div class="detail-label">Address</div>
                <div class="detail-text">${mockInvoice.company.address.join('<br />')}</div>
              </div>
              <div>
                <div class="detail-label">Contact</div>
                <div class="detail-text">
                  ${mockInvoice.company.email}<br />
                  ${mockInvoice.company.phone}<br />
                  ${mockInvoice.company.website}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="detail-card">
          <div class="detail-grid">
            <div>
              <div class="detail-label">Bill To</div>
              <div class="detail-value">${mockInvoice.billedTo.name}</div>
              <div class="detail-meta">Attn: ${mockInvoice.billedTo.attention}</div>
            </div>
            <div class="detail-cols">
              <div>
                <div class="detail-label">Address</div>
                <div class="detail-text">${mockInvoice.billedTo.address.join('<br />')}</div>
              </div>
              <div>
                <div class="detail-label">Contact</div>
                <div class="detail-text">
                  ${mockInvoice.billedTo.email}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="detail-card">
          <div class="detail-grid">
            <div>
              <div class="detail-label">Payment</div>
              <div class="detail-value">${mockInvoice.payment.method}</div>
              <div class="detail-meta">Status: ${mockInvoice.status}</div>
            </div>
            <div class="detail-cols">
              <div>
                <div class="detail-label">Transaction</div>
                <div class="detail-text">${mockInvoice.payment.txnId}</div>
              </div>
              <div>
                <div class="detail-label">Paid</div>
                <div class="detail-text">${mockInvoice.payment.paidAt}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="line-items" aria-label="Invoice line items">
        <header>
          <div>Description</div>
          <div style="text-align:right;">Qty</div>
          <div style="text-align:right;">Amount</div>
        </header>
        ${mockInvoice.items
          .map(
            (item) => `<div class="row">
          <div>${item.description}</div>
          <div style="text-align:right;">${item.quantity}</div>
          <div style="text-align:right;">${formatMoney(
            item.unitPriceCents * item.quantity,
          )}</div>
        </div>`,
          )
          .join('')}
      </section>

      <div class="totals" aria-label="Totals">
        <div class="row">
          <div style="text-align:right;">Subtotal</div>
          <div style="text-align:right;">${formatMoney(subtotalCents)}</div>
        </div>
        <div class="row">
          <div style="text-align:right;">Tax (${(mockInvoice.taxRate * 100).toFixed(2)}%)</div>
          <div style="text-align:right;">${formatMoney(taxCents)}</div>
        </div>
        <div class="row total">
          <div style="text-align:right;">Total</div>
          <div style="text-align:right;">${formatMoney(totalCents)}</div>
        </div>
      </div>

      <div class="actions">
        <button class="button" onclick="window.print()">Print / Save as PDF</button>
        <a class="button secondary" href="/settings/billing">Back to billing</a>
      </div>

      <p class="footer">
        ${mockInvoice.notes.join('<br />')}
      </p>
    </main>
    <script>
      if (window && typeof window.print === 'function') {
        window.setTimeout(() => window.print(), 400);
      }
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
    },
  });
}
