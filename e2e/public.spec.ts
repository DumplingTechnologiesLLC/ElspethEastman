import { test, expect, database } from './fixtures.ts';

test('home renders every content section from the API', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /HI, I'M ELSPETH/ }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Voice acting fixture: characters, narration, and animation.',
    ),
  ).toBeVisible();
  for (const category of [
    'Voice Credits',
    'Music - Games',
    'Music - Miscellaneous',
    'Streaming - Credits',
  ] as const) {
    await expect(
      page.getByRole('heading', { name: category, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: new RegExp(`Fixture ${category}`) }),
    ).toHaveAttribute('target', '_blank');
  }
  await expect(
    page.getByRole('link', { name: 'Fixture Studio' }),
  ).toHaveAttribute('href', 'https://example.invalid/studio');
  await expect(page.getByText('Fixture games', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Interesting Facts' }),
  ).toBeVisible();
});

test('skill selector switches all three descriptions', async ({ page }) => {
  await page.goto('/');
  for (const [name, description] of [
    ['Streaming', 'Streaming fixture: games and community broadcasts.'],
    [
      'Game Development',
      'Game development fixture: music and interactive worlds.',
    ],
    [
      'Voice Acting',
      'Voice acting fixture: characters, narration, and animation.',
    ],
  ] as const) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByText(description, { exact: true })).toBeVisible();
  }
});

test('latest projects paginate without duplicates and stop at the last page', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('img[alt^="Select this thumbnail"]')).toHaveCount(
    4,
  );
  await expect(
    page.getByText('Fixture Project 6', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Load more', exact: true }).click();
  await expect(page.locator('img[alt^="Select this thumbnail"]')).toHaveCount(
    6,
  );
  await expect(
    page.getByRole('button', { name: 'Load more', exact: true }),
  ).toBeDisabled();
  for (let index = 1; index <= 6; index++)
    await expect(
      page.getByText(`Fixture Project ${index}`, { exact: true }),
    ).toHaveCount(1);
});

test('all projects supports direct entry, reload, and returning home', async ({
  page,
}) => {
  await page.goto('/projects/');
  await expect(
    page.getByRole('heading', { name: 'All Projects', exact: true }),
  ).toBeVisible();
  await expect(page.locator('img[alt^="Select this thumbnail"]')).toHaveCount(
    6,
  );
  await page.reload();
  await expect(
    page.getByText('Fixture Project 1', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Go back', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: /HI, I'M ELSPETH/ }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'See all projects', exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/projects$/);
});

test('video loads only after activation and preserves the embed URL', async ({
  page,
}) => {
  await page.goto('/projects');
  await expect(page.locator('iframe[src*="youtube.com/embed/"]')).toHaveCount(
    0,
  );
  await page.locator('[aria-label="Video Loader: Fixture Project 6"]').click();
  await expect(
    page.getByTitle('Embedded Youtube Video: Fixture Project 6'),
  ).toHaveAttribute(
    'src',
    'https://www.youtube.com/embed/e2e-video-6?rel=0&showinfo=0&autoplay=1',
  );
  await expect(page.locator('iframe[src*="youtube.com/embed/"]')).toHaveCount(
    1,
  );
  await page.goto('/');
  await expect(page.getByTitle('My soundcloud')).toHaveAttribute(
    'src',
    /auto_play=false/,
  );
});

test('empty project lists show the current fallback', async ({ page }) => {
  database('empty-projects');
  await page.goto('/projects');
  await expect(
    page.getByText('Failed to load...', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('img[alt^="Select this thumbnail"]')).toHaveCount(
    0,
  );
});

test('failed project requests show a recovery message', async ({ page }) => {
  await page.route('**/api/projects/list/', (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
  );
  await page.goto('/projects');
  await expect(
    page.getByText('Failed to load...', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Failed to load projects' }),
  ).toBeVisible();
});

test('navigation links reach the public sections from the projects page', async ({
  page,
  isMobile,
}) => {
  await page.goto('/projects');
  if (isMobile) {
    await expect(page.locator('nav ul')).toHaveCSS('height', '0px');
    await page.locator('nav button').click();
  }
  await page
    .getByRole('link', { name: 'Latest Projects', exact: true })
    .click();
  await expect(page).toHaveURL(/\/#latestProjects$/);
  await expect(
    page.getByRole('heading', { name: 'Latest Projects', exact: true }),
  ).toBeVisible();
});

test('anonymous CMS deep links redirect to login', async ({ page }) => {
  for (const path of ['/cms', '/cms/'] as const) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Save All Changes' }),
    ).toHaveCount(0);
  }
});
