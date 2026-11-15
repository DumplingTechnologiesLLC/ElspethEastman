import type { ProjectDTO } from '../frontend/src/application/dto/ProjectDTO';
import {
  it,
  expect,
  database,
  login,
  projectCards,
  projectSection,
  actionResponse,
} from './fixtures.ts';

it.beforeEach(async ({ page }) => login(page));

it('switches skills, resets unsaved changes, and persists to the public page', async ({
  page,
}) => {
  const field = page.locator('textarea[name="Voice Acting"]');
  await field.fill('Discard this voice draft');
  await page
    .getByRole('button', { name: 'Reset Changes', exact: true })
    .first()
    .click();
  await expect(field).toHaveValue(
    'Voice acting fixture: characters, narration, and animation.',
  );
  await field.fill('Updated voice description');
  await page
    .getByRole('button', { name: 'Game Development', exact: true })
    .click();
  await page
    .locator('textarea[name="Game Development"]')
    .fill('Updated game description');
  await actionResponse(page, 'PATCH', '/api/skills/', () =>
    page.getByRole('button', { name: 'Save All Changes', exact: true }).click(),
  );
  expect(database().skills[0]!).toMatchObject({
    voice_acting: 'Updated voice description',
    game_development: 'Updated game description',
  });
  await page.goto('/');
  await expect(
    page.getByText('Updated voice description', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Game Development', exact: true })
    .click();
  await expect(
    page.getByText('Updated game description', { exact: true }),
  ).toBeVisible();
});

it('validates blank skills without replacing saved content', async ({
  page,
}) => {
  await page.locator('textarea[name="Voice Acting"]').fill('');
  await actionResponse(
    page,
    'PATCH',
    '/api/skills/',
    () =>
      page
        .getByRole('button', { name: 'Save All Changes', exact: true })
        .click(),
    400,
  );
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'There was an issue updating skills.' }),
  ).toBeVisible();
  expect(database().skills[0]!.voice_acting).toMatch(/^Voice acting fixture/);
});

it('reports expired write tokens and leaves saved skills intact', async ({
  page,
}) => {
  database('expire-tokens');
  await page
    .locator('textarea[name="Voice Acting"]')
    .fill('Unauthorized replacement');
  await actionResponse(
    page,
    'PATCH',
    '/api/skills/',
    () =>
      page
        .getByRole('button', { name: 'Save All Changes', exact: true })
        .click(),
    403,
  );
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Your session has expired. Please log in again.' }),
  ).toBeVisible();
  expect(database().skills[0]!.voice_acting).toMatch(/^Voice acting fixture/);
});

it('preserves the cached project form through preview and reset', async ({
  page,
}) => {
  const card = projectCards(page).first();
  await expect(card.locator('input[name$="-title"]')).toHaveValue(
    'Fixture Project 6',
  );
  await card.locator('input[name$="-title"]').fill('Unsaved project');
  await card.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(
    card.getByText('Unsaved project', { exact: true }),
  ).toBeVisible();
  await card.getByRole('button', { name: 'View Form', exact: true }).click();
  await card.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(card.locator('input[name$="-title"]')).toHaveValue(
    'Fixture Project 6',
  );
  expect(database().projects[0]!.title).toBe('Fixture Project 6');
});

it('creates, edits, and deletes projects through the browser and public API', async ({
  page,
}) => {
  await page
    .getByRole('button', { name: 'Add New Project', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Add new Project',
    exact: true,
  });
  await dialog.locator('input[name$="-title"]').fill('New integration project');
  await dialog.locator('input[name$="-source"]').fill('new-video');
  const created = await actionResponse<{ project: { id: number } }>(
    page,
    'POST',
    '/api/projects/list/',
    () => dialog.getByRole('button', { name: 'Save', exact: true }).click(),
  );
  await expect(projectCards(page)).toHaveCount(7);
  const card = projectCards(page).last();
  await card
    .locator('input[name$="-title"]')
    .fill('Updated integration project');
  await actionResponse(
    page,
    'PATCH',
    `/api/projects/list/${created.project.id}/`,
    () => card.getByRole('button', { name: 'Save', exact: true }).click(),
  );
  await page.reload();
  await expect(
    page.locator('input[name$="-title"]').filter({ visible: true }).first(),
  ).toBeVisible();
  const updated = projectCards(page).filter({
    has: page.locator('input[value="Updated integration project"]'),
  });
  await expect(updated).toHaveCount(1);
  const publicProjects: ProjectDTO[] = await (
    await page.request.get('/api/projects/list/')
  ).json();
  expect(
    publicProjects.find((project) => project.id === created.project.id)!.title,
  ).toBe('Updated integration project');
  page.once('dialog', (confirmation) => confirmation.accept());
  await actionResponse(
    page,
    'DELETE',
    `/api/projects/list/${created.project.id}/`,
    () => updated.getByRole('button', { name: 'Delete', exact: true }).click(),
  );
  await expect(projectCards(page)).toHaveCount(6);
  expect(
    database().projects.some((project) => project.id === created.project.id),
  ).toBe(false);
});

it('persists a project batch and keeps records after delete cancellation', async ({
  page,
}) => {
  const cards = projectCards(page);
  await cards.nth(0).locator('input[name$="-title"]').fill('Batch project six');
  await cards
    .nth(1)
    .locator('input[name$="-title"]')
    .fill('Batch project five');
  await actionResponse(page, 'PATCH', '/api/projects/list/batch_update/', () =>
    projectSection(page)
      .getByRole('button', { name: 'Save All', exact: true })
      .click(),
  );
  await page.reload();
  await expect(cards.nth(0).locator('input[name$="-title"]')).toHaveValue(
    'Batch project six',
  );
  await expect(cards.nth(1).locator('input[name$="-title"]')).toHaveValue(
    'Batch project five',
  );
  page.once('dialog', (confirmation) => confirmation.dismiss());
  await cards
    .first()
    .getByRole('button', { name: 'Delete', exact: true })
    .click();
  await expect(cards).toHaveCount(6);
  expect(database().projects).toHaveLength(6);
});

it('reports server errors without creating invalid projects', async ({
  page,
}) => {
  await page
    .getByRole('button', { name: 'Add New Project', exact: true })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Add new Project',
    exact: true,
  });
  await actionResponse(
    page,
    'POST',
    '/api/projects/list/',
    () => dialog.getByRole('button', { name: 'Save', exact: true }).click(),
    400,
  );
  await expect(dialog.getByText('This field may not be blank.')).toHaveCount(2);
  expect(database().projects).toHaveLength(6);
});

it.each([
  ['Voice Credits', 'Add new credit'],
  ['Music - Games', 'Add new music'],
  ['Music - Miscellaneous', 'Add new music'],
  ['Streaming - Credits', 'Add new credit'],
] as const)(([category, button]) =>
  it(`creates, edits, and deletes experience with TBA formatting in ${category}`, async ({
    page,
  }) => {
    const section = page
      .getByRole('heading', { name: category, exact: true })
      .locator('..');
    await section.getByRole('button', { name: button, exact: true }).click();
    const dialog = page.getByRole('dialog', {
      name: 'Experience Form',
      exact: true,
    });
    await dialog
      .locator('input[name="ExperienceCredit"]')
      .fill(`New ${category}`);
    await dialog.locator('input[name="ExperienceYear"]').fill('2025');
    await dialog
      .locator('input[name="ExperienceLink"]')
      .fill('https://example.invalid/new-credit');
    const created = await actionResponse<{ object: { id: number } }>(
      page,
      'POST',
      '/api/experience/',
      () => dialog.getByRole('button', { name: 'Save', exact: true }).click(),
    );
    await expect(
      section.getByRole('link', {
        name: `(2025) New ${category}`,
        exact: true,
      }),
    ).toBeVisible();
    const row = section
      .getByRole('link', { name: `(2025) New ${category}`, exact: true })
      .locator('..');
    await row.getByRole('button').nth(1).click();
    await dialog
      .locator('input[name="ExperienceCredit"]')
      .fill(`Updated ${category}`);
    await dialog.locator('input[name="ExperienceTBA"]').check();
    await actionResponse(
      page,
      'PATCH',
      `/api/experience/${created.object.id}/`,
      () => dialog.getByRole('button', { name: 'Save', exact: true }).click(),
    );
    await page.reload();
    const updated = section
      .getByRole('link', { name: `(TBA) Updated ${category}`, exact: true })
      .locator('..');
    await expect(updated).toBeVisible();
    page.once('dialog', (confirmation) => confirmation.dismiss());
    await updated.getByRole('button').nth(0).click();
    expect(
      database().experience.some((item) => item.id === created.object.id),
    ).toBe(true);
    page.once('dialog', (confirmation) => confirmation.accept());
    await actionResponse(
      page,
      'DELETE',
      `/api/experience/${created.object.id}/`,
      () => updated.getByRole('button').nth(0).click(),
    );
    await expect(updated).toHaveCount(0);
    expect(
      database().experience.some((item) => item.id === created.object.id),
    ).toBe(false);
  }),
);

it('preserves saved experience through reset and required-credit validation', async ({
  page,
}) => {
  const row = page
    .getByRole('link', { name: '(2021) Fixture Voice Credits', exact: true })
    .locator('..');
  await row.getByRole('button').nth(1).click();
  const dialog = page.getByRole('dialog', {
    name: 'Experience Form',
    exact: true,
  });
  await dialog
    .locator('input[name="ExperienceCredit"]')
    .fill('Discard this credit');
  await dialog
    .getByRole('button', { name: 'Reset Changes', exact: true })
    .click();
  await expect(dialog.locator('input[name="ExperienceCredit"]')).toHaveValue(
    'Fixture Voice Credits',
  );
  await dialog.locator('input[name="ExperienceCredit"]').fill('');
  await actionResponse(
    page,
    'PATCH',
    '/api/experience/1/',
    () => dialog.getByRole('button', { name: 'Save', exact: true }).click(),
    400,
  );
  await expect(dialog.getByText('This field may not be blank.')).toBeVisible();
  expect(database().experience.find((item) => item.id === 1)!.credit).toBe(
    'Fixture Voice Credits',
  );
});

it('resets, creates, edits, and deletes affiliations with confirmation', async ({
  page,
}) => {
  const form = page
    .locator('form')
    .filter({ has: page.locator('input[value="Fixture Studio"]') });
  await form
    .locator('input[name="affiliationLink"]')
    .fill('https://example.invalid/unsaved');
  await form.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(form.locator('input[name="affiliationLink"]')).toHaveValue(
    'https://example.invalid/studio',
  );
  await page.getByRole('button', { name: 'Create new affiliation' }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Add new Affiliation',
    exact: true,
  });
  await dialog.locator('input[name="affiliationText"]').fill('New Studio');
  await dialog
    .locator('input[name="affiliationLink"]')
    .fill('https://example.invalid/new-studio');
  const created = await actionResponse<{ id: number }>(
    page,
    'POST',
    '/api/affiliations/',
    () => dialog.getByRole('button', { name: 'Save', exact: true }).click(),
  );
  // Closed modals retain their inputs; select the saved footer form.
  const newForm = page
    .locator('form:not([role="dialog"] form)')
    .filter({ has: page.locator('input[value="New Studio"]') });
  await expect(newForm).toHaveCount(1);
  await newForm
    .locator('input[name="affiliationLink"]')
    .fill('https://example.invalid/updated-studio');
  await actionResponse(page, 'PATCH', `/api/affiliations/${created.id}/`, () =>
    newForm.getByRole('button', { name: 'Save', exact: true }).click(),
  );
  await page.reload();
  await expect(newForm.locator('input[name="affiliationLink"]')).toHaveValue(
    'https://example.invalid/updated-studio',
  );
  page.once('dialog', (confirmation) => confirmation.dismiss());
  await newForm.getByRole('button', { name: 'Delete', exact: true }).click();
  expect(database().affiliations).toHaveLength(2);
  page.once('dialog', (confirmation) => confirmation.accept());
  await actionResponse(page, 'DELETE', `/api/affiliations/${created.id}/`, () =>
    newForm.getByRole('button', { name: 'Delete', exact: true }).click(),
  );
  await expect(newForm).toHaveCount(0);
  expect(database().affiliations).toHaveLength(1);
});

it('shows saved affiliations on the public site', async ({ page }) => {
  const form = page
    .locator('form')
    .filter({ has: page.locator('input[value="Fixture Studio"]') });
  const id = database().affiliations[0]!.id;
  await form
    .locator('input[name="affiliationLink"]')
    .fill('https://example.invalid/public-studio');
  await actionResponse(page, 'PATCH', `/api/affiliations/${id}/`, () =>
    form.getByRole('button', { name: 'Save', exact: true }).click(),
  );
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: 'Fixture Studio' }),
  ).toHaveAttribute('href', 'https://example.invalid/public-studio');
});

it('closes the invalid-affiliation form without creating a record', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Create new affiliation' }).click();
  const dialog = page.getByRole('dialog', {
    name: 'Add new Affiliation',
    exact: true,
  });
  await actionResponse(
    page,
    'POST',
    '/api/affiliations/',
    () => dialog.getByRole('button', { name: 'Save', exact: true }).click(),
    400,
  );
  await expect(dialog).toHaveCSS('opacity', '0');
  expect(database().affiliations).toHaveLength(1);
});
