import { resolveSafeNextPath } from '@/lib/security/redirects';

describe('resolveSafeNextPath', () => {
  it('defaults to dashboard when next is missing', () => {
    expect(resolveSafeNextPath(null)).toBe('/dashboard');
  });

  it('keeps safe internal paths with query and hash', () => {
    expect(resolveSafeNextPath('/risk-events?updated=1#top')).toBe(
      '/risk-events?updated=1#top',
    );
  });

  it('rejects absolute external URLs', () => {
    expect(resolveSafeNextPath('https://evil.example/phish')).toBe(
      '/dashboard',
    );
  });

  it('rejects protocol-relative URLs', () => {
    expect(resolveSafeNextPath('//evil.example/phish')).toBe('/dashboard');
  });

  it('rejects newline injection attempts', () => {
    expect(resolveSafeNextPath('/dashboard\nhttps://evil.example')).toBe(
      '/dashboard',
    );
  });
});
