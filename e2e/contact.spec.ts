import type { Page, Locator, Route } from '@playwright/test';
import { it, expect, database, actionResponse } from './fixtures.ts';

async function contact(page: Page) {
  await page.goto('/');
  const dialog = page.getByRole('form', { name: 'Contact Elspeth' });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function fillContact(dialog: Locator) {
  await dialog.locator('input[name="name"]').fill('E2E visitor');
  await dialog.locator('input[name="email"]').fill('visitor@example.invalid');
  await dialog
    .locator('textarea')
    .fill('An isolated integration test message.');
}

it('validates required contact fields without sending a request', async ({
  page,
}) => {
  const dialog = await contact(page);
  await dialog.getByRole('button', { name: 'Send message' }).click();
  await Promise.all(
    ['Name', 'Email', 'Message'].map((field) =>
      expect(
        dialog.getByText(`${field} is required`, { exact: true }),
      ).toBeVisible(),
    ),
  );
  expect(database().contacts).toEqual([]);
});

it('persists anonymous contact through Django and clears after success', async ({
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
    dialog.getByRole('button', { name: 'Send message' }).click(),
  );
  expect((await sent).headers()).not.toHaveProperty('authorization');
  expect(result).toEqual({ message: 'Success' });
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: "Submitted form. I'll be in touch soon!" }),
  ).toBeVisible();
  await expect(dialog.locator('input[name="name"]')).toHaveValue('');
  await expect(dialog.locator('input[name="email"]')).toHaveValue('');
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

it('disables contact submission while its real request is pending', async ({
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
    (pendingResponse) =>
      new URL(pendingResponse.url()).pathname === '/api/contact-me/',
  );
  const submit = dialog.getByRole('button', { name: 'Send message' });
  try {
    await submit.click();
    await expect(
      dialog.getByRole('button', { name: 'Sending…' }),
    ).toBeDisabled();
  } finally {
    release();
  }
  expect((await response).status()).toBe(200);
  await expect(submit).toBeEnabled();
  expect(database().contacts).toHaveLength(1);
});

it('retains the draft and returns Django validation for invalid email', async ({
  page,
}) => {
  const dialog = await contact(page);
  await fillContact(dialog);
  await dialog.locator('input[name="email"]').fill('invalid');
  await actionResponse(
    page,
    'POST',
    '/api/contact-me/',
    () => dialog.getByRole('button', { name: 'Send message' }).click(),
    400,
  );
  await expect(dialog.getByText('Enter a valid email address.')).toBeVisible();
  await expect(dialog.locator('input[name="name"]')).toHaveValue('E2E visitor');
  expect(database().contacts).toEqual([]);
});

it.each(['server', 'network'] as const)((failure) =>
  it(`preserves the contact draft and allows retry after ${failure} failure`, async ({
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
    await dialog.getByRole('button', { name: 'Send message' }).click();
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
      dialog.getByRole('button', { name: 'Send message' }).click(),
    );
    expect(database().contacts).toHaveLength(1);
  }),
);
