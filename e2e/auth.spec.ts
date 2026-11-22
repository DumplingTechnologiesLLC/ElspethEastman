import { it, expect, login, actionResponse } from './fixtures.ts';

it('validates required login credentials', async ({ page }) => {
  await page.goto('/login');
  const submit = page.getByRole('button', { name: 'Login', exact: true });
  await submit.click();
  await expect(page.getByText('Username is required')).toBeVisible();
  await page.locator('input[name="username"]').fill('e2e-editor');
  await submit.click();
  await expect(page.getByText('Password is required')).toBeVisible();
});

it('keeps the user outside the CMS with incorrect credentials', async ({
  page,
}) => {
  await page.goto('/login');
  await page.locator('input[name="username"]').fill('e2e-editor');
  await page.locator('input[name="password"]').fill('incorrect-password');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Bad login' }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('ElspethEastmanAuthToken'),
    ),
  ).toBeNull();
});

it('preserves UI login through reload and navigation and revokes the token on logout', async ({
  page,
}) => {
  await login(page, true);
  const token = await page.evaluate(() =>
    sessionStorage.getItem('ElspethEastmanAuthToken'),
  );
  expect(token).toMatch(/^[a-f0-9]{40}$/);
  expect(
    await actionResponse(page, 'POST', '/api/v2/session/', () => page.reload()),
  ).toEqual({ isAuthenticated: true });
  await expect(page.locator('textarea[name="Voice Acting"]')).toHaveValue(
    /Voice acting fixture/,
  );
  expect(
    await actionResponse(page, 'POST', '/api/v2/session/', () =>
      page.getByRole('link', { name: 'View Public Site' }).click(),
    ),
  ).toEqual({ isAuthenticated: true });
  await expect(page).toHaveURL(/\/$/);
  expect(
    await actionResponse(page, 'POST', '/api/v2/session/', () =>
      page.goto('/cms'),
    ),
  ).toEqual({ isAuthenticated: true });
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('ElspethEastmanAuthToken'),
    ),
  ).toBeNull();
  const validation = await page.request.get('/api/v2/session/', {
    headers: { Authorization: `Token ${token}` },
  });
  expect(await validation.json()).toEqual({ isAuthenticated: false });
  await page.goto('/cms');
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcms$/);
});

it('clears browser credentials after aborted validation and preserves the server token', async ({
  page,
}) => {
  await login(page);
  const token = await page.evaluate(() =>
    sessionStorage.getItem('ElspethEastmanAuthToken'),
  );
  await page.route('**/api/v2/session/', (route) => route.abort('failed'));
  await page.getByRole('link', { name: 'View Public Site' }).click();
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcms$/);
  await expect(
    page.getByRole('alert').filter({ hasText: 'Session has expired' }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('ElspethEastmanAuthToken'),
    ),
  ).toBeNull();
  const response = await page.request.get('/api/v2/session/', {
    headers: { Authorization: `Token ${token}` },
  });
  expect(await response.json()).toEqual({ isAuthenticated: true });
});

it('clears an invalid saved token and redirects to login', async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('ElspethEastmanAuthToken', 'invalid-token'),
  );
  await page.goto('/cms');
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcms$/);
  await expect(
    page.getByRole('alert').filter({ hasText: 'Session has expired' }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('ElspethEastmanAuthToken'),
    ),
  ).toBeNull();
});

it('reports login network failures and allows a fresh retry', async ({
  page,
}) => {
  await page.goto('/login');
  await page.locator('input[name="username"]').fill('e2e-editor');
  await page.locator('input[name="password"]').fill('e2e-only-password');
  await page.route('**/api/v2/session/login/', (route) =>
    route.abort('failed'),
  );
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Network error' }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await page.unroute('**/api/v2/session/login/');
  await login(page, true);
});

it('clears browser credentials after aborted logout and retains the server token', async ({
  page,
}) => {
  await login(page);
  const token = await page.evaluate(() =>
    sessionStorage.getItem('ElspethEastmanAuthToken'),
  );
  await page.route('**/api/v2/session/logout/', (route) =>
    route.abort('failed'),
  );
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('alert').filter({ hasText: 'Network error' }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('ElspethEastmanAuthToken'),
    ),
  ).toBeNull();
  const response = await page.request.get('/api/v2/session/', {
    headers: { Authorization: `Token ${token}` },
  });
  expect(await response.json()).toEqual({ isAuthenticated: true });
});
