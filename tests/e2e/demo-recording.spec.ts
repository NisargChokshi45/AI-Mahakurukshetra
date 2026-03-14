/**
 * Demo Recording Script — SupplySense AI
 *
 * Generates a narrated video walkthrough of the full product.
 * Uses Playwright's built-in video recording (recordVideo in playwright.config.ts).
 *
 * Run:
 *   DEMO_BASE_URL=https://your-vercel-url.vercel.app pnpm playwright test tests/e2e/demo-recording.spec.ts --headed
 *
 * Output: playwright-report/demo-video/ (MP4, ~5 min)
 *
 * Tips:
 *   - Use --headed so the browser is visible (looks better on screen recording)
 *   - Set DEMO_BASE_URL to your production Vercel URL for the real demo
 *   - The script pauses between sections so you can narrate live, or record
 *     the Playwright run inside Loom/OBS for voiceover in post
 *   - DEMO_ROLE_EMAIL / DEMO_ROLE_PASSWORD env vars set the login credentials
 *     (defaults to the Apex Resilience demo role seeded in seed.sql)
 */

import { expect, test } from '@playwright/test';

const BASE_URL = process.env.DEMO_BASE_URL ?? 'http://localhost:3000';
// Override with real credentials if the seeded demo password differs in your env.
// Defaults match the hardcoded values in the login page demo buttons.
const DEMO_EMAIL = process.env.DEMO_ROLE_EMAIL ?? 'owner@apex-resilience.demo';
const DEMO_PASSWORD = process.env.DEMO_ROLE_PASSWORD ?? 'DemoPass123!';

// How long to pause so the viewer can read each screen (ms)
const LOOK = 2500;
// Slower typing speed for visual clarity
const TYPE_DELAY = 60;

test.use({
  baseURL: BASE_URL,
  viewport: { width: 1440, height: 900 },
  // Video is configured at the project level in playwright.config.ts
});

test('SupplySense AI — Full Product Demo', async ({ page }) => {
  // ─── 1. LANDING PAGE ─────────────────────────────────────────────────────
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK);

  // Scroll down to show features section
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }));
  await page.waitForTimeout(LOOK);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // ─── 2. LOGIN ─────────────────────────────────────────────────────────────
  await page
    .getByRole('link', { name: /log in/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/login/);
  await page.waitForTimeout(1000);

  // Always use the email/password form — demo role buttons also go through
  // signInAction and will bounce back to /login if the Supabase user isn't found.
  await page
    .getByRole('textbox', { name: /email/i })
    .fill(DEMO_EMAIL, { delay: TYPE_DELAY });
  await page
    .getByRole('textbox', { name: /password/i })
    .fill(DEMO_PASSWORD, { delay: TYPE_DELAY });
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Server action + Supabase round-trip can take several seconds
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK);

  // ─── 3. DASHBOARD ─────────────────────────────────────────────────────────
  // Scroll to show KPI cards
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
  await page.waitForTimeout(LOOK);

  // Scroll to show supplier watchlist
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'smooth' }));
  await page.waitForTimeout(LOOK);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // ─── 4. SUPPLIER DIRECTORY ────────────────────────────────────────────────
  await page
    .getByRole('link', { name: /suppliers/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/suppliers$/);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK);

  // Show filter interaction
  const regionSelect = page.locator('select').first();
  if (await regionSelect.isVisible()) {
    await regionSelect.selectOption({ index: 1 });
    await page.waitForTimeout(1200);
    await regionSelect.selectOption({ index: 0 });
    await page.waitForTimeout(800);
  }

  // Open highest-risk supplier using the dedicated header CTA
  await page.getByRole('link', { name: /open highest-risk supplier/i }).click();

  await expect(page).toHaveURL(/\/suppliers\/.+/);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK);

  // ─── 5. SUPPLIER DETAIL ───────────────────────────────────────────────────
  // Show risk score breakdown
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(LOOK);
  await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'smooth' }));
  await page.waitForTimeout(LOOK);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // ─── 6. RISK EVENTS ───────────────────────────────────────────────────────
  await page.goto('/risk-events');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK);

  // Show filter interaction
  const severityFilter = page.locator('select[name="severity"], select').nth(1);
  if (await severityFilter.isVisible()) {
    await severityFilter.selectOption({ index: 1 });
    await page.waitForTimeout(1000);
    await severityFilter.selectOption({ index: 0 });
    await page.waitForTimeout(800);
  }

  // ─── 7. NEW RISK EVENT INGESTION ──────────────────────────────────────────
  await page.goto('/risk-events/new');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK);

  // Fill the form slowly so viewers can read it
  const titleField = page.getByRole('textbox', { name: /title/i }).first();
  if (await titleField.isVisible()) {
    await titleField.fill('Port Strike — Southeast Asia', {
      delay: TYPE_DELAY,
    });
  }

  const descField = page
    .getByRole('textbox', { name: /description|summary/i })
    .first();
  if (await descField.isVisible()) {
    await descField.fill(
      'Major port workers strike affecting container throughput across Malaysia and Thailand. Estimated 2–3 week disruption.',
      { delay: TYPE_DELAY },
    );
  }

  const typeSelect = page
    .locator('select[name="event_type"], select[name="type"]')
    .first();
  if (await typeSelect.isVisible()) {
    await typeSelect.selectOption('operational');
    await page.waitForTimeout(500);
  }

  const severitySelect = page.locator('select[name="severity"]').first();
  if (await severitySelect.isVisible()) {
    await severitySelect.selectOption('high');
    await page.waitForTimeout(500);
  }

  await page.waitForTimeout(LOOK);

  // Submit
  const submitBtn = page
    .getByRole('button', { name: /submit|save|create/i })
    .first();
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }

  // ─── 8. INCIDENTS BOARD ───────────────────────────────────────────────────
  await page.goto('/incidents');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK);

  // Open first incident — rows are full-row links identified by data-testid
  const firstIncident = page.locator('[data-testid^="incident-card-"]').first();
  if (await firstIncident.isVisible()) {
    await firstIncident.click();
    await expect(page).toHaveURL(/\/incidents\/.+/);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(LOOK);

    // Scroll through timeline
    await page.evaluate(() =>
      window.scrollTo({ top: 500, behavior: 'smooth' }),
    );
    await page.waitForTimeout(LOOK);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
  }

  // ─── 9. SUPPLY CHAIN MAP ──────────────────────────────────────────────────
  await page.goto('/map');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK * 1.5); // Let the graph render

  // Pan/interact with map if nodes are visible
  const mapCanvas = page.locator('canvas, svg').first();
  if (await mapCanvas.isVisible()) {
    const box = await mapCanvas.boundingBox();
    if (box) {
      // Hover center to show tooltip
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(1000);
      // Hover a different node
      await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.4);
      await page.waitForTimeout(1000);
    }
  }
  await page.waitForTimeout(LOOK);

  // ─── 10. REPORTS ─────────────────────────────────────────────────────────
  await page.goto('/reports');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK);

  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(LOOK);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // ─── 11. ASSESSMENTS ─────────────────────────────────────────────────────
  await page.goto('/assessments');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK);

  // ─── 12. SETTINGS — MEMBERS ──────────────────────────────────────────────
  await page.goto('/settings/members');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK);

  // ─── 13. SETTINGS — BILLING ──────────────────────────────────────────────
  await page.goto('/settings/billing');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK);

  // ─── 14. API DOCS ────────────────────────────────────────────────────────
  await page.goto('/api/docs');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK * 1.5); // Swagger takes a moment to render

  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(LOOK);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // ─── 15. HEALTH CHECK ────────────────────────────────────────────────────
  await page.goto('/api/health');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK);

  // ─── END ─────────────────────────────────────────────────────────────────
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(LOOK);
});
