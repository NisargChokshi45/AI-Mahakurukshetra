import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

const FLASH_COOKIE_NAME = '__flash_notifications';

export type FlashPayload = Partial<Record<'error' | 'message', string>>;

type CookieStore = Awaited<ReturnType<typeof cookies>>;

async function getCookieStore(): Promise<CookieStore> {
  return await cookies();
}

function parsePayload(value: string | undefined): FlashPayload {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return parsed as FlashPayload;
    }
  } catch (error) {
    // Ignore invalid JSON and fall through to empty payload.
    void error;
  }

  return {};
}

export async function setFlash(payload: FlashPayload): Promise<void> {
  const cookieStore = await getCookieStore();
  const existing = parsePayload(cookieStore.get(FLASH_COOKIE_NAME)?.value);
  const merged = { ...existing, ...payload };

  cookieStore.set({
    name: FLASH_COOKIE_NAME,
    value: JSON.stringify(merged),
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 60,
  });
}

// Read-only: cookie modifications are only allowed in Server Actions / Route Handlers.
// The flash cookie has a 60-second maxAge so it expires automatically.
export async function consumeFlash(): Promise<FlashPayload> {
  const cookieStore = await getCookieStore();
  const existingCookie = cookieStore.get(FLASH_COOKIE_NAME);
  if (!existingCookie) {
    return {};
  }

  return parsePayload(existingCookie.value);
}

// Call this from a Server Action or Route Handler to eagerly clear the flash.
export async function clearFlash(): Promise<void> {
  const cookieStore = await getCookieStore();
  cookieStore.delete(FLASH_COOKIE_NAME);
}

export function attachFlash(response: NextResponse, payload: FlashPayload) {
  const existing = parsePayload(response.cookies.get(FLASH_COOKIE_NAME)?.value);
  const merged = { ...existing, ...payload };

  response.cookies.set({
    name: FLASH_COOKIE_NAME,
    value: JSON.stringify(merged),
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 60,
  });
}
