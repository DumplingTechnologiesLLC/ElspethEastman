import { test, expect, login, actionResponse } from './fixtures.ts';

test('login validates required credentials', async ({ page }) => {
  await page.goto('/login');
  const submit = page.getByRole('button', { name: 'Login', exact: true });
  await submit.click();
  await expect(page.getByText('Username is required')).toBeVisible();
  await page.locator('input[name="username"]').fill('e2e-editor');
  await submit.click();
  await expect(page.getByText('Password is required')).toBeVisible();
});

test('incorrect credentials keep the user outside the CMS', async ({
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

test('UI login survives reload, public navigation, and logout revokes the token', async ({
  page,
}) => {
  await login(page, true);
  const token = await page.evaluate(() =>
    sessionStorage.getItem('ElspethEastmanAuthToken'),
  );
  expect(token).toMatch(/^[a-f0-9]{40}$/);
  expect(
    await actionResponse(page, 'POST', '/api/session/', () => page.reload()),
  ).toEqual({ isAuthenticated: true });
  await expect(page.locator('textarea[name="Voice Acting"]')).toHaveValue(
    /Voice acting fixture/,
  );
  expect(
    await actionResponse(page, 'POST', '/api/session/', () =>
      page.getByRole('link', { name: 'View Public Site' }).click(),
    ),
  ).toEqual({ isAuthenticated: true });
  await expect(page).toHaveURL(/\/$/);
  expect(
    await actionResponse(page, 'POST', '/api/session/', () =>
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
  const validation = await page.request.get('/api/session/', {
    headers: { Authorization: `Token ${token}` },
  });
  expect(await validation.json()).toEqual({ isAuthenticated: false });
  await page.goto('/cms');
  await expect(page).toHaveURL(/\/login$/);
});

test('current aborted session validation clears browser credentials while the server token remains valid', async ({
  page,
}) => {
  await login(page);
  const token = await page.evaluate(() =>
    sessionStorage.getItem('ElspethEastmanAuthToken'),
  );
  await page.route('**/api/session/', (route) => route.abort('failed'));
  await page.getByRole('link', { name: 'View Public Site' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('alert').filter({ hasText: 'Session has expired' }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('ElspethEastmanAuthToken'),
    ),
  ).toBeNull();
  const response = await page.request.get('/api/session/', {
    headers: { Authorization: `Token ${token}` },
  });
  expect(await response.json()).toEqual({ isAuthenticated: true });
});

test('an invalid saved token is cleared and redirects to login', async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('ElspethEastmanAuthToken', 'invalid-token'),
  );
  await page.goto('/cms');
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('alert').filter({ hasText: 'Session has expired' }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('ElspethEastmanAuthToken'),
    ),
  ).toBeNull();
});
