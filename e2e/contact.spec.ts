import type { Page, Locator, Route } from '@playwright/test';
import { test, expect, database, actionResponse } from './fixtures.ts';

async function contact(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Get in touch', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: /Contact Me/ });
  await expect(dialog).toHaveCSS('opacity', '1');
  return dialog;
}

async function fillContact(dialog: Locator) {
  await dialog.locator('input[name="Name"]').fill('E2E visitor');
  await dialog.locator('input[name="Email"]').fill('visitor@example.invalid');
  await dialog
    .locator('textarea')
    .fill('An isolated integration test message.');
}

test('contact validates required fields without sending a request', async ({
  page,
}) => {
  const dialog = await contact(page);
  await dialog.getByRole('button', { name: 'Get in touch' }).click();
  for (const field of ['Name', 'Email', 'Message'])
    await expect(
      dialog.getByText(`${field} is required`, { exact: true }),
    ).toBeVisible();
  expect(database().contacts).toEqual([]);
});

test('anonymous contact reaches Django, persists, and clears after success', async ({
  page,
}) => {
  const dialog = await contact(page);
  await fillContact(dialog);
  const sent = page.waitForRequest(
    (request) =>
      new URL(request.url()).pathname === '/api/contact-me/' &&
      request.method() === 'POST',
  );
  const result = await actionResponse(page, 'POST', '/api/contact-me/', () =>
    dialog.getByRole('button', { name: 'Get in touch' }).click(),
  );
  expect((await sent).headers()).not.toHaveProperty('authorization');
  expect(result).toEqual({ message: 'Success' });
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: "Submitted form. I'll be in touch soon!" }),
  ).toBeVisible();
  await expect(dialog.locator('input[name="Name"]')).toHaveValue('');
  await expect(dialog.locator('input[name="Email"]')).toHaveValue('');
  await expect(dialog.locator('textarea')).toHaveValue('');
  expect(database().contacts).toEqual([
    {
      name: 'E2E visitor',
      email: 'visitor@example.invalid',
      message: 'An isolated integration test message.',
      sent: true,
    },
  ]);
});

test('contact disables submission while its real request is pending', async ({
  page,
}) => {
  const dialog = await contact(page);
  await fillContact(dialog);
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/contact-me/', async (route) => {
    await pending;
    await route.continue();
  });
  const response = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/contact-me/',
  );
  const submit = dialog.getByRole('button', { name: 'Get in touch' });
  try {
    await submit.click();
    await expect(submit).toBeDisabled();
  } finally {
    release();
  }
  expect((await response).status()).toBe(200);
  await expect(submit).toBeEnabled();
  expect(database().contacts).toHaveLength(1);
});

test('invalid email returns Django validation and retains the draft', async ({
  page,
}) => {
  const dialog = await contact(page);
  await fillContact(dialog);
  await dialog.locator('input[name="Email"]').fill('invalid');
  await actionResponse(
    page,
    'POST',
    '/api/contact-me/',
    () => dialog.getByRole('button', { name: 'Get in touch' }).click(),
    400,
  );
  await expect(dialog.getByText('Enter a valid email address.')).toBeVisible();
  await expect(dialog.locator('input[name="Name"]')).toHaveValue('E2E visitor');
  expect(database().contacts).toEqual([]);
});

test('closing and reopening contact discards the draft and validation', async ({
  page,
}) => {
  const dialog = await contact(page);
  await fillContact(dialog);
  await dialog.getByRole('button', { name: 'Close Modal' }).click();
  await expect(dialog.locator('input')).toHaveCount(0);
  await page.getByRole('button', { name: 'Get in touch', exact: true }).click();
  await expect(dialog.locator('input[name="Name"]')).toHaveValue('');
  await expect(dialog.locator('textarea')).toHaveValue('');
});

for (const failure of ['server', 'network'] as const) {
  test(`${failure} failure preserves the contact draft and allows retry`, async ({
    page,
  }) => {
    const dialog = await contact(page);
    const fail = (route: Route) =>
      failure === 'server'
        ? route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: '{}',
          })
        : route.abort('failed');
    await page.route('**/api/contact-me/', fail);
    await fillContact(dialog);
    await dialog.getByRole('button', { name: 'Get in touch' }).click();
    await expect(
      page.getByRole('alert').filter({
        hasText:
          failure === 'server' ? 'There was a server error.' : 'Network error',
      }),
    ).toBeVisible();
    await expect(dialog.locator('textarea')).toHaveValue(
      'An isolated integration test message.',
    );
    expect(database().contacts).toEqual([]);
    await page.unroute('**/api/contact-me/', fail);
    await actionResponse(page, 'POST', '/api/contact-me/', () =>
      dialog.getByRole('button', { name: 'Get in touch' }).click(),
    );
    expect(database().contacts).toHaveLength(1);
  });
}
