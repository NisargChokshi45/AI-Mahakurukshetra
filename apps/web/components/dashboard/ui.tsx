import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Severity } from '@/lib/demo-data';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type SectionCardProps = Readonly<{
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}>;

type PageHeaderProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}>;

type EmptyStateProps = Readonly<{
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}>;

type SparklineProps = Readonly<{
  values: number[];
  strokeClassName?: string;
}>;

export function buttonStyles(variant: ButtonVariant = 'primary') {
  return cn(
    'inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    variant === 'primary' &&
      'bg-primary text-primary-foreground shadow-[0_16px_40px_-24px_rgba(5,46,22,0.85)] hover:opacity-90',
    variant === 'secondary' &&
      'border border-border bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground',
    variant === 'ghost' &&
      'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
  );
}

export function selectStyles(className?: string) {
  return cn(
    'border-border/70 bg-background/85 text-foreground min-h-11 w-full cursor-pointer appearance-none rounded-2xl border px-4 pr-10 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition outline-none',
    'focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-70',
    className,
  );
}

type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
};

export function SelectField({
  className,
  wrapperClassName,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      <select {...props} className={selectStyles(className)}>
        {children}
      </select>
      <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-3">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.28em] uppercase">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-7 md:text-base">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}

export function SectionCard({
  eyebrow,
  title,
  description,
  children,
  className,
  actions,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'border-border/70 bg-card/85 rounded-[28px] border p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.5)] backdrop-blur',
        className,
      )}
    >
      <div className="border-border/70 flex flex-col gap-4 border-b pb-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          {eyebrow ? (
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="text-muted-foreground max-w-2xl text-sm leading-6">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-3">{actions}</div>
        ) : null}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  detail,
}: Readonly<{ label: string; value: string; detail: string }>) {
  return (
    <article className="border-border/70 bg-background/80 rounded-[24px] border p-5">
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="text-muted-foreground mt-2 text-sm">{detail}</p>
    </article>
  );
}

export function RiskScoreBadge({
  score,
  className,
}: Readonly<{ score: number; className?: string }>) {
  const tone =
    score >= 80
      ? 'bg-[rgba(127,29,29,0.12)] text-[rgb(153,27,27)]'
      : score >= 65
        ? 'bg-[rgba(146,64,14,0.12)] text-[rgb(146,64,14)]'
        : 'bg-[rgba(21,128,61,0.12)] text-[rgb(21,128,61)]';

  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center rounded-full px-3 text-sm font-semibold',
        tone,
        className,
      )}
    >
      Risk {score}
    </span>
  );
}

export function SeverityBadge({ severity }: Readonly<{ severity: Severity }>) {
  const tones: Record<Severity, string> = {
    critical: 'bg-[rgba(127,29,29,0.12)] text-[rgb(153,27,27)]',
    high: 'bg-[rgba(190,24,93,0.12)] text-[rgb(190,24,93)]',
    medium: 'bg-[rgba(146,64,14,0.12)] text-[rgb(146,64,14)]',
    low: 'bg-[rgba(21,128,61,0.12)] text-[rgb(21,128,61)]',
  };

  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center rounded-full px-3 text-sm font-semibold capitalize',
        tones[severity],
      )}
    >
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: Readonly<{ status: string }>) {
  const normalized = status.toLowerCase();
  const tone =
    normalized === 'resolved' ||
    normalized === 'completed' ||
    normalized === 'stable'
      ? 'bg-[rgba(21,128,61,0.12)] text-[rgb(21,128,61)]'
      : normalized === 'draft' ||
          normalized === 'scheduled' ||
          normalized === 'monitoring'
        ? 'bg-[rgba(8,145,178,0.12)] text-[rgb(14,116,144)]'
        : normalized === 'investigating' || normalized === 'mitigating'
          ? 'bg-[rgba(146,64,14,0.12)] text-[rgb(146,64,14)]'
          : 'bg-[rgba(127,29,29,0.12)] text-[rgb(153,27,27)]';

  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center rounded-full px-3 text-sm font-semibold capitalize',
        tone,
      )}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="border-border/80 bg-background/55 flex flex-col items-start gap-4 rounded-[24px] border border-dashed p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground max-w-xl text-sm leading-6">
          {description}
        </p>
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={buttonStyles('secondary')}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function Sparkline({
  values,
  strokeClassName = 'stroke-primary',
}: SparklineProps) {
  const width = 180;
  const height = 60;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const range = max - min || 1;
      const y = height - ((value - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-16 w-full"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        strokeWidth="3"
        points={points}
        className={strokeClassName}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LoadingGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={`loading-card-${index}`}
          className="border-border/70 bg-card/70 animate-pulse rounded-[24px] border p-5"
        >
          <div className="bg-muted h-3 w-24 rounded-full" />
          <div className="bg-muted mt-5 h-8 w-20 rounded-full" />
          <div className="bg-muted mt-6 h-3 w-full rounded-full" />
          <div className="bg-muted mt-2 h-3 w-2/3 rounded-full" />
        </div>
      ))}
    </div>
  );
}
