import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  CreditCard,
  ReceiptText,
  PauseCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { requireOrganizationContext } from '@/lib/auth/session';
import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';
import { consumeFlash, setFlash } from '@/lib/flash';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Billing Settings | Supply Chain Risk Intelligence Platform',
  description:
    'Billing workspace with live subscription state and usage visibility.',
};

type PlanStatus = 'active' | 'inactive' | 'available';

type BillingPlan = {
  ctaLabel: string;
  description: string;
  isCheckoutEnabled: boolean;
  id: string;
  priceLabel: string;
  priceValueCents: number;
  supplierLimit: number | null;
  status: PlanStatus;
  statusLabel: string;
  suppliers: string;
  title: string;
};

type PriceRow = {
  currency: string | null;
  id: string;
  interval: 'month' | 'year' | null;
  is_active: boolean;
  nickname: string | null;
  supplier_limit: number | null;
  unit_amount: number | null;
};

type SubscriptionRow = {
  current_period_end: string | null;
  price_id: string | null;
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
};

type PaymentHistoryRow = {
  amount: number;
  currency: string;
  paid_at: string;
  status: 'succeeded' | 'failed';
};

type BillingSettingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatPrice(
  currency: string | null,
  unitAmount: number | null,
  interval: string | null,
) {
  if (!currency || unitAmount === null) {
    return '--';
  }

  const normalizedInterval = interval === 'year' ? 'yr' : 'mo';

  return (
    new Intl.NumberFormat('en-US', {
      currency: currency.toUpperCase(),
      style: 'currency',
    }).format(unitAmount / 100) + `/${normalizedInterval}`
  );
}

function formatCurrency(currency: string | null, amountCents: number | null) {
  if (!currency || amountCents === null) {
    return '--';
  }

  return new Intl.NumberFormat('en-US', {
    currency: currency.toUpperCase(),
    style: 'currency',
  }).format(amountCents / 100);
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function getSupplierLimitLabel(limit: number | null) {
  if (!limit) {
    return 'Flexible supplier scope';
  }

  if (limit >= 1000000) {
    return 'Unlimited visibility';
  }

  return `Up to ${limit} suppliers`;
}

function getPlanDescription(limit: number | null) {
  if (!limit) {
    return 'Flexible supplier monitoring with custom capacity controls.';
  }

  if (limit <= 25) {
    return 'Best for smaller supplier footprints with stable monthly volumes.';
  }

  if (limit <= 100) {
    return 'Designed for teams coordinating incidents across multiple supplier tiers.';
  }

  return 'Built for complex multi-region programs with broad supplier networks.';
}

function resolveSubscriptionActivity(status: SubscriptionRow['status'] | null) {
  if (!status) {
    return {
      badgeLabel: 'Inactive',
      isActive: false,
      summaryText: 'No active subscription',
    };
  }

  if (status === 'canceled') {
    return {
      badgeLabel: 'Inactive',
      isActive: false,
      summaryText: 'Canceled',
    };
  }

  if (status === 'trialing') {
    return {
      badgeLabel: 'Active',
      isActive: true,
      summaryText: 'Trialing',
    };
  }

  if (status === 'past_due') {
    return {
      badgeLabel: 'Active',
      isActive: true,
      summaryText: 'Past due',
    };
  }

  return {
    badgeLabel: 'Active',
    isActive: true,
    summaryText: 'Active',
  };
}

function buildBillingPlans(
  prices: PriceRow[],
  subscription: SubscriptionRow | null,
): BillingPlan[] {
  const subscriptionState = resolveSubscriptionActivity(
    subscription?.status ?? null,
  );

  return prices
    .sort((a, b) => (a.unit_amount ?? 0) - (b.unit_amount ?? 0))
    .map((price) => {
      const isCurrentPlan = subscription?.price_id === price.id;
      const status: PlanStatus = isCurrentPlan
        ? subscriptionState.isActive
          ? 'active'
          : 'inactive'
        : 'available';

      return {
        ctaLabel: isCurrentPlan ? 'Current plan' : 'Switch plan',
        description: getPlanDescription(price.supplier_limit),
        isCheckoutEnabled: !isCurrentPlan,
        id: price.id,
        priceLabel: formatPrice(
          price.currency,
          price.unit_amount,
          price.interval,
        ),
        priceValueCents: price.unit_amount ?? 0,
        supplierLimit: price.supplier_limit,
        status,
        statusLabel:
          status === 'active'
            ? subscriptionState.badgeLabel
            : status === 'inactive'
              ? 'Inactive'
              : 'Available',
        suppliers: getSupplierLimitLabel(price.supplier_limit),
        title: price.nickname ?? 'Coverage plan',
      };
    });
}

function getPlanHighlights(limit: number | null) {
  if (!limit) {
    return [
      'Custom supplier capacity bands',
      'Dedicated billing support',
      'Advanced contract governance',
    ];
  }

  if (limit <= 25) {
    return [
      'Core risk and incident workflows',
      'Single-team operating model',
      'Monthly plan review checkpoints',
    ];
  }

  if (limit <= 100) {
    return [
      'Cross-team response coordination',
      'Expanded supplier monitoring',
      'Priority incident triage support',
    ];
  }

  return [
    'Portfolio-wide monitoring scale',
    'Multi-region response governance',
    'Executive-grade reporting workflows',
  ];
}

function getUsageLabel(usagePercent: number | null) {
  if (usagePercent === null) {
    return 'Capacity open';
  }

  if (usagePercent >= 90) {
    return 'Near limit';
  }

  if (usagePercent >= 70) {
    return 'Watch usage';
  }

  return 'Healthy headroom';
}

function getUsageToneClasses(usagePercent: number | null) {
  if (usagePercent === null || usagePercent < 70) {
    return '[&::-moz-progress-bar]:bg-emerald-500 [&::-webkit-progress-value]:bg-emerald-500';
  }

  if (usagePercent < 90) {
    return '[&::-moz-progress-bar]:bg-amber-500 [&::-webkit-progress-value]:bg-amber-500';
  }

  return '[&::-moz-progress-bar]:bg-rose-500 [&::-webkit-progress-value]:bg-rose-500';
}

export default async function BillingSettingsPage({
  searchParams,
}: BillingSettingsPageProps) {
  const context = await requireOrganizationContext();
  const params = (await searchParams) ?? {};
  const queryError = readMessage(params.error);
  const queryMessage = readMessage(params.message);

  if (queryError || queryMessage) {
    if (queryError) {
      await setFlash({ error: queryError });
    }
    if (queryMessage) {
      await setFlash({ message: queryMessage });
    }
    redirect('/settings/billing');
  }
  const { error, message } = await consumeFlash();
  const supabase = await createClient();
  const isOwner = context.organization.role === 'owner';
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  const checkoutAction = stripeConfigured
    ? '/api/stripe/checkout'
    : '/api/stripe/dummy/checkout';
  const portalAction = stripeConfigured
    ? '/api/stripe/portal'
    : '/api/stripe/dummy/portal';
  const invoiceAction = stripeConfigured
    ? '/api/stripe/invoice/latest'
    : '/api/stripe/dummy/invoice/latest';
  const invoiceTarget = stripeConfigured ? undefined : '_blank';

  const { count: supplierCount } = await supabase
    .from('suppliers')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', context.organization.organizationId);

  const { data: pricesData } = await supabase
    .from('prices')
    .select(
      'id, nickname, currency, unit_amount, interval, supplier_limit, is_active',
    )
    .eq('is_active', true);

  let subscription: SubscriptionRow | null = null;
  let latestPayment: PaymentHistoryRow | null = null;

  if (isOwner) {
    const [{ data: subscriptionData }, { data: paymentData }] =
      await Promise.all([
        supabase
          .from('subscriptions')
          .select('status, current_period_end, price_id')
          .eq('organization_id', context.organization.organizationId)
          .maybeSingle(),
        supabase
          .from('payment_history')
          .select('status, paid_at, amount, currency')
          .eq('organization_id', context.organization.organizationId)
          .order('paid_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    subscription = (subscriptionData as SubscriptionRow | null) ?? null;
    latestPayment = (paymentData as PaymentHistoryRow | null) ?? null;
  }

  const billingPlans = buildBillingPlans(
    ((pricesData ?? []) as PriceRow[]).filter((row) => row.is_active),
    subscription,
  );

  const fallbackPlans: BillingPlan[] = [
    {
      ctaLabel: 'Unavailable',
      description: 'Pricing data is not available for this environment yet.',
      isCheckoutEnabled: false,
      id: 'fallback-starter',
      priceLabel: '--',
      priceValueCents: 0,
      supplierLimit: 25,
      status: 'inactive',
      statusLabel: 'Inactive',
      suppliers: 'Up to 25 suppliers',
      title: 'Starter',
    },
  ];

  const renderedPlans = billingPlans.length > 0 ? billingPlans : fallbackPlans;
  const currentPlan =
    renderedPlans.find((plan) => plan.status === 'active') ??
    renderedPlans.find((plan) => plan.status === 'inactive') ??
    renderedPlans[0];

  const supplierLimit = currentPlan?.supplierLimit ?? null;
  const usedSuppliers = supplierCount ?? 0;
  const usagePercent =
    supplierLimit && supplierLimit > 0
      ? Math.min(100, Math.round((usedSuppliers / supplierLimit) * 100))
      : null;
  const renewalDate = formatDate(subscription?.current_period_end ?? null);
  const invoiceStatusText = latestPayment
    ? latestPayment.status === 'succeeded'
      ? `Paid on ${formatDate(latestPayment.paid_at)}`
      : `Failed on ${formatDate(latestPayment.paid_at)}`
    : 'No invoice history';
  const latestPaymentAmount = latestPayment
    ? formatCurrency(latestPayment.currency, latestPayment.amount)
    : '--';
  const subscriptionState = resolveSubscriptionActivity(
    subscription?.status ?? null,
  );
  const usageLabel = getUsageLabel(usagePercent);
  const usageToneClasses = getUsageToneClasses(usagePercent);
  const usageMax = supplierLimit ?? 100;
  const usageValue =
    usagePercent === null
      ? 100
      : Math.min(usedSuppliers, supplierLimit ?? usedSuppliers);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Plan control and workspace spend visibility"
        description="Manage subscription state, monitor supplier capacity, and execute billing actions from one operational surface."
      />

      {!isOwner ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Billing details are restricted to the workspace owner by RBAC
            policy.
          </p>
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
      {!stripeConfigured ? (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Stripe secret key is not configured. Billing actions are running in
            dummy mode for local/demo testing.
          </p>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BillingMetricCard
          label="Current plan"
          value={currentPlan?.title ?? 'Not configured'}
          detail={subscriptionState.summaryText}
        />
        <BillingMetricCard
          label="Cycle spend"
          value={currentPlan?.priceLabel ?? '--'}
          detail="Based on current selected tier"
        />
        <BillingMetricCard
          label="Supplier usage"
          value={
            supplierLimit
              ? `${usedSuppliers}/${supplierLimit}`
              : `${usedSuppliers}/∞`
          }
          detail={usageLabel}
        />
        <BillingMetricCard
          label="Latest invoice"
          value={latestPaymentAmount}
          detail={invoiceStatusText}
        />
      </section>

      <SectionCard
        eyebrow="Control Center"
        title="Subscription health and billing actions"
        description="Review current subscription posture and launch operational billing actions without leaving settings."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[24px] border border-emerald-200 bg-[linear-gradient(145deg,rgba(236,253,245,0.85),rgba(240,249,255,0.8))] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-sm font-semibold tracking-[0.24em] uppercase">
                  Active subscription
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">
                  {currentPlan?.title ?? 'Not configured'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {subscriptionState.summaryText}
                </p>
              </div>
              <PlanStatusPill
                status={subscriptionState.isActive ? 'active' : 'inactive'}
              />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-3">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                  Renewal date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {renewalDate}
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-3">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                  Invoice status
                </p>
                <p
                  className={cn(
                    'mt-1 text-sm font-semibold',
                    latestPayment?.status === 'failed'
                      ? 'text-red-700'
                      : 'text-emerald-700',
                  )}
                >
                  {invoiceStatusText}
                </p>
              </div>
            </div>
          </div>

          <div className="border-border/70 bg-background/90 flex flex-col justify-between space-y-4 rounded-[24px] border p-5">
            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center justify-between text-sm">
                <span>Supplier capacity utilization</span>
                <span className="font-semibold text-slate-800">
                  {usagePercent !== null ? `${usagePercent}%` : 'Unlimited'}
                </span>
              </div>
              <progress
                className={cn(
                  'h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-200',
                  usageToneClasses,
                )}
                max={usageMax}
                value={usageValue}
              />
              <p className="text-muted-foreground text-sm">
                {supplierLimit
                  ? `${usedSuppliers} of ${supplierLimit} monitored suppliers are currently active this cycle.`
                  : `${usedSuppliers} monitored suppliers are currently active this cycle.`}
              </p>
            </div>

            <div className="grid gap-2">
              <form action={portalAction} method="post">
                <button
                  type="submit"
                  className={cn(
                    buttonStyles('primary'),
                    'w-full justify-start',
                  )}
                  disabled={!isOwner}
                >
                  <CreditCard className="mr-2 h-4 w-4" aria-hidden="true" />
                  {stripeConfigured
                    ? 'Open billing portal'
                    : 'Open dummy billing portal'}
                  <ArrowUpRight
                    className="ml-auto h-4 w-4"
                    aria-hidden="true"
                  />
                </button>
              </form>
              <form action={invoiceAction} method="post" target={invoiceTarget}>
                <button
                  type="submit"
                  className={cn(
                    buttonStyles('secondary'),
                    'w-full justify-start',
                  )}
                  disabled={!isOwner || !latestPayment}
                >
                  <ReceiptText className="mr-2 h-4 w-4" aria-hidden="true" />
                  {stripeConfigured
                    ? 'Download latest invoice'
                    : 'Open dummy invoice'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Plan Catalog"
        title="Select the right coverage tier"
        description="Plan cards reflect live subscription state and workspace supplier capacity data."
      >
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {renderedPlans.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                'flex flex-col rounded-[24px] border p-5 transition',
                plan.status === 'active'
                  ? 'border-emerald-300 bg-emerald-50/70 shadow-[0_22px_45px_-32px_rgba(22,163,74,0.45)]'
                  : plan.status === 'inactive'
                    ? 'border-amber-300 bg-amber-50/60'
                    : 'border-border/70 bg-background/85',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                    {plan.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {plan.suppliers}
                  </p>
                </div>
                <PlanStatusPill status={plan.status} label={plan.statusLabel} />
              </div>

              <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                {plan.priceLabel}
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {plan.description}
              </p>

              <div className="mt-4 grow space-y-2 rounded-2xl border border-slate-200/80 bg-white/60 p-3">
                {getPlanHighlights(plan.supplierLimit).map((highlight) => (
                  <p
                    key={`${plan.id}-${highlight}`}
                    className="flex items-start gap-2 text-xs leading-5 text-slate-600"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
                      aria-hidden="true"
                    />
                    {highlight}
                  </p>
                ))}
              </div>

              <form action={checkoutAction} method="post">
                <input type="hidden" name="priceId" value={plan.id} />
                <button
                  type="submit"
                  disabled={
                    !isOwner ||
                    !plan.isCheckoutEnabled ||
                    plan.priceValueCents <= 0
                  }
                  className={cn(
                    buttonStyles(
                      plan.status === 'active' ? 'secondary' : 'primary',
                    ),
                    'mt-5 w-full',
                    (!isOwner ||
                      !plan.isCheckoutEnabled ||
                      plan.priceValueCents <= 0) &&
                      'cursor-default opacity-60',
                  )}
                >
                  {isOwner
                    ? plan.isCheckoutEnabled
                      ? stripeConfigured
                        ? plan.ctaLabel
                        : `Dummy ${plan.ctaLabel.toLowerCase()}`
                      : 'Current plan'
                    : 'Owner access required'}
                </button>
              </form>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Compliance"
        title="Billing governance checkpoints"
        description="Use these checkpoints to keep plan utilization and payment hygiene aligned with procurement operations."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-800">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              <p className="text-sm font-semibold">Renewal readiness</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Confirm ownership and budget approvals before {renewalDate}.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-800">
              <ReceiptText className="h-4 w-4" aria-hidden="true" />
              <p className="text-sm font-semibold">Invoice traceability</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Latest payment status: {invoiceStatusText}. Keep records attached
              to monthly close workflows.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-800">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <p className="text-sm font-semibold">Capacity governance</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Supplier usage is currently {usageLabel.toLowerCase()}. Review
              limits before adding high-volume supplier cohorts.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function BillingMetricCard({
  label,
  value,
  detail,
}: Readonly<{
  detail: string;
  label: string;
  value: string;
}>) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1.5 text-sm text-slate-600">{detail}</p>
    </article>
  );
}

function PlanStatusPill({
  status,
  label,
}: Readonly<{ status: PlanStatus; label?: string }>) {
  const text =
    label ??
    (status === 'active'
      ? 'Active'
      : status === 'inactive'
        ? 'Inactive'
        : 'Available');

  if (status === 'active') {
    return (
      <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-emerald-100 px-3 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        {text}
      </span>
    );
  }

  if (status === 'inactive') {
    return (
      <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-amber-100 px-3 text-xs font-semibold text-amber-700">
        <PauseCircle className="h-4 w-4" aria-hidden="true" />
        {text}
      </span>
    );
  }

  return (
    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-sky-100 px-3 text-xs font-semibold text-sky-700">
      <CircleDashed className="h-4 w-4" aria-hidden="true" />
      {text}
    </span>
  );
}
