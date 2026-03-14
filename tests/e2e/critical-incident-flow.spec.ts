import { expect, test } from '@playwright/test';

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

test.describe('Critical Incident Journey', () => {
  test.skip(
    !email || !password,
    'Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run authenticated flow tests.',
  );

  test('login -> dashboard -> supplier detail -> create incident -> resolve incident', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.getByRole('textbox', { name: 'Email' }).fill(email ?? '');
    await page.getByRole('textbox', { name: 'Password' }).fill(password ?? '');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
    await expect(page.getByText('Supplier Watchlist')).toBeVisible({
      timeout: 15_000,
    });

    await page.goto('/suppliers');
    await page
      .getByRole('link', { name: /open highest-risk supplier/i })
      .click();
    await expect(page).toHaveURL(/\/suppliers\/.+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.getByRole('link', { name: /view related incidents/i }).click();
    await expect(page).toHaveURL(/\/incidents$/);

    const incidentTitle = `E2E Incident ${Date.now()}`;
    await page.getByTestId('incident-title-input').fill(incidentTitle);
    await page.getByTestId('incident-priority-select').selectOption('high');
    await page
      .getByTestId('incident-summary-input')
      .fill('Automated E2E incident created to validate response lifecycle.');
    await page.getByTestId('create-incident-submit').click();

    await expect(page).toHaveURL(/\/incidents\/.+\?created=1$/);
    await expect(
      page.getByText('Incident created successfully.'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: incidentTitle }),
    ).toBeVisible();

    await page.getByTestId('resolve-incident-submit').click();

    await expect(page).toHaveURL(/\/incidents\/.+\?resolved=1$/);
    await expect(
      page.getByText('Incident resolved successfully.'),
    ).toBeVisible();
    await expect(page.getByTestId('incident-status-value')).toContainText(
      'resolved',
    );
  });
});
