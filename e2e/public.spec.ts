import { it, expect, database } from './fixtures.ts';

it('renders every home content section from the API', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /HI, I'M ELSPETH/ }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Voice acting fixture: characters, narration, and animation.',
    ),
  ).toBeVisible();
  await Promise.all(
    (
      [
        'Voice Credits',
        'Music - Games',
        'Music - Miscellaneous',
        'Streaming - Credits',
      ] as const
    ).flatMap((category) => [
      expect(
        page.getByRole('heading', { name: category, exact: true }),
      ).toBeVisible(),
      expect(
        page.getByRole('link', { name: new RegExp(`Fixture ${category}`) }),
      ).toHaveAttribute('target', '_blank'),
    ]),
  );
  await expect(
    page.getByRole('link', { name: 'Fixture Studio' }),
  ).toHaveAttribute('href', 'https://example.invalid/studio');
  await expect(page.getByText('Fixture games', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Interesting Facts' }),
  ).toBeVisible();
});

it.each([
  ['Streaming', 'Streaming fixture: games and community broadcasts.'],
  [
    'Game Development',
    'Game development fixture: music and interactive worlds.',
  ],
  [
    'Voice Acting',
    'Voice acting fixture: characters, narration, and animation.',
  ],
] as const)(([name, description]) =>
  it(`switches to the ${name} skill description`, async ({ page }) => {
    await page.goto('/');
    if (name === 'Voice Acting')
      await page
        .getByRole('button', { name: 'Streaming', exact: true })
        .click();
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByText(description, { exact: true })).toBeVisible();
  }),
);

it('paginates latest projects without duplicates and stops at the last page', async ({
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
  await Promise.all(
    Array.from({ length: 6 }, (_, index) =>
      expect(
        page.getByText(`Fixture Project ${index + 1}`, { exact: true }),
      ).toHaveCount(1),
    ),
  );
});

it('supports direct project entry, reload, and returning home', async ({
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

it('loads video only after activation and preserves the embed URL', async ({
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

it('shows the current fallback for empty project lists', async ({ page }) => {
  database('empty-projects');
  await page.goto('/projects');
  await expect(
    page.getByText('Failed to load...', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('img[alt^="Select this thumbnail"]')).toHaveCount(
    0,
  );
});

it('shows a recovery message after failed project requests', async ({
  page,
}) => {
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

it('navigates to public sections from the projects page', async ({
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

it.each(['/cms', '/cms/'] as const)((path) =>
  it(`redirects anonymous ${path} deep links to login`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(
      new URL(`/login?returnTo=${encodeURIComponent(path)}`, page.url()).href,
    );
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Save All Changes' }),
    ).toHaveCount(0);
  }),
);
