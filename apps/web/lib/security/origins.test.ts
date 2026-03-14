import { isOriginAllowed } from '@/lib/security/origins';

describe('isOriginAllowed', () => {
  it('allows an exact origin match', () => {
    const rules = [{ origin: 'http://localhost:3000', type: 'exact' }] as const;

    expect(isOriginAllowed('http://localhost:3000', [...rules])).toBe(true);
  });

  it('treats localhost and loopback IP as equivalent for exact rules', () => {
    const rules = [{ origin: 'http://localhost:3000', type: 'exact' }] as const;

    expect(isOriginAllowed('http://127.0.0.1:3000', [...rules])).toBe(true);
  });

  it('rejects loopback origins with a different port', () => {
    const rules = [{ origin: 'http://localhost:3000', type: 'exact' }] as const;

    expect(isOriginAllowed('http://127.0.0.1:3001', [...rules])).toBe(false);
  });
});
