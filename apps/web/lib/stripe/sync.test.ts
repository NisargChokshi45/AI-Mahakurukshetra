import {
  mapStripeSubscriptionStatus,
  unixSecondsToIso,
} from '@/lib/stripe/sync';

describe('stripe sync utilities', () => {
  it('maps known Stripe statuses to app statuses', () => {
    expect(mapStripeSubscriptionStatus('active')).toBe('active');
    expect(mapStripeSubscriptionStatus('past_due')).toBe('past_due');
    expect(mapStripeSubscriptionStatus('unpaid')).toBe('past_due');
    expect(mapStripeSubscriptionStatus('canceled')).toBe('canceled');
    expect(mapStripeSubscriptionStatus('incomplete_expired')).toBe('canceled');
  });

  it('defaults unknown Stripe statuses to trialing', () => {
    expect(mapStripeSubscriptionStatus('incomplete')).toBe('trialing');
  });

  it('converts unix timestamps into ISO strings', () => {
    expect(unixSecondsToIso(1_700_000_000)).toBe('2023-11-14T22:13:20.000Z');
    expect(unixSecondsToIso(0)).toBeNull();
    expect(unixSecondsToIso(null)).toBeNull();
  });
});
