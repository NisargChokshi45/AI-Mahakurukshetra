export type AppSubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing';

export function mapStripeSubscriptionStatus(
  status: string,
): AppSubscriptionStatus {
  if (status === 'active') {
    return 'active';
  }

  if (status === 'past_due' || status === 'unpaid') {
    return 'past_due';
  }

  if (status === 'canceled' || status === 'incomplete_expired') {
    return 'canceled';
  }

  return 'trialing';
}

export function unixSecondsToIso(
  value: number | null | undefined,
): string | null {
  if (!value || value <= 0) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}
