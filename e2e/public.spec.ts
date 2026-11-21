import { it, expect, aggregate, stablePage } from './fixtures.ts';
it.each([
  ['', 'A distinctive voice'],
  ['voiceover', 'Voiceover'],
  ['music', 'Music'],
  ['streaming', 'Streaming'],
  ['press', 'Press'],
  ['bio', 'Bio'],
] as const)(([slug, heading]) =>
  it(`loads ${slug || 'home'} on a fresh public request`, async ({ page }) => {
    await page.goto('/' + slug);
    await stablePage(page);
    expect(await page.title()).toContain('Elspeth Eastman');
    if (slug === '')
      await expect(
        page.getByRole('heading', { name: new RegExp(heading) }),
      ).toBeVisible();
    else
      await expect(
        page.getByRole('heading', { name: heading, exact: true, level: 1 }),
      ).toBeVisible();
    await expect(page.getByText('© 2026 Elspeth Eastman')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Page settings', exact: true }),
    ).toHaveCount(0);
  }),
);
it('navigates through the responsive menu and restores toggle focus with Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 400, height: 900 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Open navigation' });
  await toggle.click();
  const menu = page.getByRole('navigation', { name: 'Mobile navigation' });
  await menu.getByRole('link', { name: 'Music', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await menu.getByRole('link', { name: 'Bio', exact: true }).click();
  await expect(page).toHaveURL(/\/bio$/);
  await expect(
    page.getByRole('button', { name: 'Open navigation' }),
  ).toHaveAttribute('aria-expanded', 'false');
  const explore = page.getByRole('region', { name: 'Explore the work' });
  await expect(explore.getByRole('link')).toHaveText([
    'Voiceover',
    'Music',
    'Streaming',
    'Press',
  ]);
  await explore.getByRole('link', { name: 'Voiceover' }).click();
  await expect(page).toHaveURL(/\/voiceover$/);
});
it.each([
  ['voiceover', 'role', 'Tristana'],
  ['press', 'entry', 'Finding her voice again'],
] as const)(([kind, parameter, title]) =>
  it(`selects ${kind} detail from one cached aggregate, restores focus, and supports history`, async ({
    page,
  }) => {
    let reads = 0;
    page.on('request', (request) => {
      if (
        /^\/api\/pages\/\d+\/$/.test(new URL(request.url()).pathname) &&
        request.method() === 'GET'
      )
        reads++;
    });
    await page.goto('/' + kind);
    await stablePage(page);
    const trigger = page.getByRole('button', { name: 'Open ' + title });
    await trigger.click();
    await expect(page).toHaveURL(new RegExp('\\?' + parameter + '=\\d+$'));
    await expect(
      page.getByRole('region', { name: title, exact: true }),
    ).toBeFocused();
    await page.getByRole('button', { name: 'Close detail' }).click();
    await expect(
      page.getByRole('button', { name: 'Open ' + title }),
    ).toBeFocused();
    expect(reads).toBe(1);
    await page.goBack();
    await expect(
      page.getByRole('button', { name: 'Close detail' }),
    ).toBeVisible();
    await page.goForward();
    await expect(
      page.getByRole('button', { name: 'Open ' + title }),
    ).toBeVisible();
    expect(reads).toBe(1);
    await page.goto('/' + kind + '?' + parameter + '=999999');
    await expect(
      page.getByRole('button', { name: 'Close detail' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Open ' + title }),
    ).toBeVisible();
    const content = await aggregate(page, kind);
    const entries =
      'roles' in content
        ? content.roles
        : 'entries' in content
          ? content.entries
          : [];
    const id = entries.find((row) => row.title === title)!.id;
    await page.goto('/' + kind + '?' + parameter + '=' + id + '#selected');
    await expect(
      page.getByRole('button', { name: 'Close detail' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Close detail' }).click();
    await expect(page).toHaveURL(new RegExp('/' + kind + '#selected$'));
  }),
);
it('keeps old and unknown page addresses missing', async ({ request }) => {
  const responses = await Promise.all(
    ['/projects', '/unknown-page', '/cms/unknown-page'].map((path) =>
      request.get(path),
    ),
  );
  for (const response of responses) expect(response.status()).toBe(404);
});
it('retries a failed aggregate read without replacing the registered route', async ({
  page,
}) => {
  await page.route('**/api/pages/*/', (route) =>
    route.fulfill({
      status: 503,
      json: { detail: 'Temporarily unavailable', fields: {} },
    }),
  );
  await page.goto('/voiceover');
  await expect(
    page.getByRole('heading', {
      name: 'Unable to load this page',
      exact: true,
    }),
  ).toBeVisible();
  await page.unroute('**/api/pages/*/');
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Open Tristana' }),
  ).toBeVisible();
  await expect(page).toHaveURL('/voiceover');
});
