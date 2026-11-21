/* oxlint-disable no-await-in-loop -- These interactions share one browser and depend on its preceding state. */
import type { Locator, Page } from '@playwright/test';
import { it, expect, login, aggregate, actionResponse } from './fixtures.ts';
const cases = [
  {
    kind: 'voiceover',
    add: 'Add role',
    name: 'Character',
    endpoint: 'content-entries',
    image: true,
    fields: {
      Character: 'New role',
      Franchise: 'Test franchise',
      Summary: 'Test role summary',
    },
  },
  {
    kind: 'music',
    add: 'Add release',
    name: 'Title',
    endpoint: 'music-releases',
    image: true,
    fields: {
      Year: '2026',
      Format: 'Single',
      Title: 'New release',
      Description: 'Test release',
      'Action label': 'Listen',
      'Action URL': 'https://example.invalid/new-release',
    },
  },
  {
    kind: 'streaming',
    add: 'Add stream',
    name: 'Title',
    endpoint: 'content-entries',
    image: false,
    fields: {
      Title: 'New stream',
      Eyebrow: 'Game',
      Description: 'Test stream',
      'Action label': 'Watch',
      'Action URL': 'https://example.invalid/new-stream',
    },
  },
  {
    kind: 'streaming',
    add: 'Add clip',
    name: 'Title',
    endpoint: 'stream-clips',
    image: false,
    fields: {
      Title: 'New clip',
      Eyebrow: 'Clip',
      Category: 'Highlights',
      'Action label': 'Play',
      'Action URL': 'https://example.invalid/new-clip',
    },
  },
  {
    kind: 'press',
    add: 'Add coverage',
    name: 'Title',
    endpoint: 'content-entries',
    image: true,
    fields: {
      Title: 'New coverage',
      Eyebrow: 'Interview',
      Description: 'Test coverage',
      'Action label': 'Read',
      'Action URL': 'https://example.invalid/new-coverage',
      'Row 1 value': 'Test outlet',
    },
  },
  {
    kind: 'press',
    add: 'Add appearance',
    name: 'Title',
    endpoint: 'appearances',
    image: false,
    fields: { Year: '2026', Title: 'New appearance', Format: 'Panel' },
  },
  {
    kind: 'bio',
    add: 'Add chapter',
    name: 'Heading',
    endpoint: 'bio-chapters',
    image: false,
    fields: {
      Eyebrow: 'New chapter',
      Heading: 'A new chapter',
      Body: 'Authored narrative',
    },
  },
  {
    kind: 'bio',
    add: 'Add current work',
    name: 'Title',
    endpoint: 'current-items',
    image: false,
    fields: {
      Eyebrow: 'Activity',
      Title: 'New activity',
      Description: 'Current activity',
    },
  },
] as const;
async function fill(dialog: Locator, fields: Readonly<Record<string, string>>) {
  for (const [label, value] of Object.entries(fields))
    await dialog.getByLabel(new RegExp('^' + label + '(?: \\*)?$')).fill(value);
}
async function publish(
  page: Page,
  dialog: Locator,
  method: string,
  path: string,
  status = 200,
) {
  const result = await actionResponse<{ id: number }>(
    page,
    method,
    path,
    () => dialog.getByRole('button', { name: 'Publish changes' }).click(),
    status,
  );
  await expect(dialog).toHaveCount(0);
  return result;
}
async function remove(page: Page, title: string, path: string) {
  await page
    .getByRole('button', { name: 'Delete ' + title, exact: true })
    .first()
    .click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByRole('region', { name: 'Confirm deletion' }),
  ).toBeVisible();
  await actionResponse(
    page,
    'DELETE',
    path,
    () => dialog.getByRole('button', { name: 'Delete permanently' }).click(),
    204,
  );
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Edit ' + title, exact: true }),
  ).toHaveCount(0);
}
it.each(cases)((item) =>
  it(`creates, edits, reloads, and deletes ${item.add.toLowerCase()}`, async ({
    page,
  }) => {
    await login(page, false, '/cms/' + item.kind);
    await page.getByRole('button', { name: item.add, exact: true }).click();
    const dialog = page.getByRole('dialog');
    await fill(dialog, item.fields);
    if (item.image) {
      await dialog
        .getByLabel('Choose image')
        .setInputFiles('portfolio/static/redesign/v1/tristana.jpg');
      await expect(
        dialog.getByRole('img', { name: 'Current image preview' }),
      ).toBeVisible();
      await dialog.getByLabel('Image alt text').fill('Test artwork');
    }
    if (item.add === 'Add coverage')
      await dialog.getByLabel(/^Published at/).fill('2026-06-12T12:30:00');
    const created = await publish(
      page,
      dialog,
      'POST',
      '/api/' + item.endpoint + '/',
      201,
    );
    const fields: Readonly<Record<string, string>> = item.fields;
    const title = fields[item.name]!;
    await expect(
      page.getByRole('button', { name: 'Edit ' + title, exact: true }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Edit ' + title, exact: true })
      .click();
    const updated = title + ' updated';
    await fill(page.getByRole('dialog'), { [item.name]: updated });
    const saved = await publish(
      page,
      page.getByRole('dialog'),
      'PATCH',
      '/api/' + item.endpoint + '/' + created.id + '/',
    );
    expect(saved.id).toBe(created.id);
    await page.reload();
    await expect(
      page.getByRole('button', { name: 'Edit ' + updated, exact: true }),
    ).toBeVisible();
    await remove(
      page,
      updated,
      '/api/' + item.endpoint + '/' + created.id + '/',
    );
  }),
);
it('edits page metadata without losing identity, selection, or query state', async ({
  page,
  request,
}) => {
  await login(page, false, '/cms/voiceover');
  const content = await aggregate(page, 'voiceover');
  const id = 'roles' in content ? content.roles[0]!.id : 0;
  await page.getByRole('button', { name: 'Open Tristana' }).click();
  await page.goto('/cms/voiceover?role=' + id + '#roles');
  await page
    .getByRole('button', { name: 'Page settings', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await fill(dialog, {
    'Navigation title': 'Characters',
    'URL slug': 'characters',
    'Action label': 'Reel',
    'Action URL': 'https://example.invalid/reel-updated',
  });
  await publish(page, dialog, 'PATCH', '/api/pages/' + content.page.id + '/');
  await expect(page).toHaveURL('/cms/characters?role=' + id + '#roles');
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Characters' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Close detail' }),
  ).toBeVisible();
  expect((await request.get('/voiceover')).status()).toBe(404);
  expect((await request.get('/characters')).status()).toBe(200);
  await page
    .getByRole('link', { name: 'View public page', exact: true })
    .click();
  await expect(page).toHaveURL('/characters?role=' + id + '#roles');
});
it('reconciles promotion and complete ordering without refetching, then closes deleted selection', async ({
  page,
}) => {
  await login(page, false, '/cms/voiceover');
  let reads = 0;
  page.on('request', (request) => {
    if (
      /^\/api\/pages\/\d+\/$/.test(new URL(request.url()).pathname) &&
      request.method() === 'GET'
    )
      reads++;
  });
  const content = await aggregate(page, 'voiceover');
  const roles = 'roles' in content ? content.roles : [];
  const target = roles.find((row) => row.title === 'Cadence')!;
  const group = page.getByRole('group', {
    name: 'Cadence editor controls',
    exact: true,
  });
  await actionResponse(page, 'PATCH', '/api/featured-items/', () =>
    group.getByRole('button', { name: 'Feature', exact: true }).click(),
  );
  await expect(page.getByRole('button', { name: 'Open Cadence' })).toHaveCount(
    2,
  );
  await actionResponse(page, 'PATCH', '/api/collections/reorder/', () =>
    page
      .getByRole('group', { name: 'Cadence editor controls', exact: true })
      .last()
      .getByRole('button', { name: 'Move Cadence up' })
      .click(),
  );
  const saved = await aggregate(page, 'voiceover');
  expect('roles' in saved ? saved.roles[0]!.id : 0).toBe(target.id);
  expect(reads).toBe(0);
  await page.getByRole('button', { name: 'Open Cadence' }).first().click();
  await remove(page, 'Cadence', '/api/content-entries/' + target.id + '/');
  await expect(page.getByRole('button', { name: 'Close detail' })).toHaveCount(
    0,
  );
  await expect(page).toHaveURL('/cms/voiceover');
  const final = await aggregate(page, 'voiceover');
  expect(
    'feature' in final && 'item_id' in final.feature
      ? final.feature.item_id
      : 0,
  ).toBeNull();
});
it('edits the music singleton without changing release membership', async ({
  page,
}) => {
  await login(page, false, '/cms/music');
  const before = await aggregate(page, 'music');
  await page
    .getByRole('button', { name: 'Edit current practice', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await fill(dialog, {
    Title: 'Piano practice',
    'Row 1 label': 'Focus',
    'Row 1 value': 'Scales',
  });
  await dialog.getByRole('button', { name: 'Move row 2 up' }).click();
  await expect(
    dialog.getByRole('button', { name: 'Add row', exact: true }),
  ).toBeDisabled();
  await publish(page, dialog, 'PATCH', '/api/music-features/');
  const after = await aggregate(page, 'music');
  expect(
    'releases' in after && 'releases' in before ? after.releases : [],
  ).toEqual('releases' in before ? before.releases : []);
  expect(
    'feature' in after && 'title' in after.feature ? after.feature.title : '',
  ).toBe('Piano practice');
});
it('edits shared copy, labels, facts, and fixed image uses through isolated forms', async ({
  page,
}) => {
  await login(page);
  await page.getByRole('button', { name: 'Add text', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel(/^Text treatment/).selectOption('body');
  await dialog.getByLabel(/^Text \*/).fill('New home paragraph');
  await publish(page, dialog, 'POST', '/api/copy/', 201);
  await expect(
    page.getByText('New home paragraph', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Add identity label', exact: true })
    .click();
  dialog = page.getByRole('dialog');
  await fill(dialog, { Label: 'Creator' });
  const label = await publish(page, dialog, 'POST', '/api/eyebrows/', 201);
  await page
    .getByRole('button', { name: 'Edit identity label' })
    .last()
    .click();
  dialog = page.getByRole('dialog');
  await fill(dialog, { Label: 'Performer' });
  await publish(page, dialog, 'PATCH', '/api/eyebrows/' + label.id + '/');
  await page
    .getByRole('button', { name: 'Edit hero image', exact: true })
    .click();
  dialog = page.getByRole('dialog');
  await fill(dialog, {
    'Image alt text': 'Updated portrait alt',
    'Image caption': 'Portrait caption',
  });
  await publish(page, dialog, 'PATCH', '/api/page-images/');
  await expect(
    page.getByRole('img', { name: 'Updated portrait alt' }),
  ).toBeVisible();
  await page.goto('/cms/bio');
  await page.getByRole('button', { name: 'Add fact', exact: true }).click();
  dialog = page.getByRole('dialog');
  await fill(dialog, { Label: 'Instrument', Value: 'Cello' });
  await publish(page, dialog, 'POST', '/api/trivia/', 201);
  await expect(page.getByText('Instrument', { exact: true })).toBeVisible();
});
it('retains failed drafts and canonical data, disables duplicate writes, and traps modal focus', async ({
  page,
}) => {
  await login(page, false, '/cms/voiceover');
  await page
    .getByRole('button', { name: 'Edit Tristana', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await fill(dialog, { Character: 'Retained draft' });
  await page.route('**/api/content-entries/*/', (route) =>
    route.request().method() === 'PATCH'
      ? route.fulfill({
          status: 400,
          json: {
            detail: 'Review fields',
            fields: { title: ['Server title error'] },
          },
        })
      : route.continue(),
  );
  await dialog.getByRole('button', { name: 'Publish changes' }).click();
  await expect(
    dialog.getByText('Server title error', { exact: true }).first(),
  ).toBeVisible();
  await expect(dialog.getByLabel(/^Character/)).toHaveValue('Retained draft');
  await expect(dialog.getByLabel(/^Character/)).toBeFocused();
  await page.unroute('**/api/content-entries/*/');
  for (let index = 0; index < 24; index++) {
    await page.keyboard.press('Tab');
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let writes = 0;
  await page.route('**/api/content-entries/*/', async (route) => {
    if (route.request().method() === 'PATCH') {
      writes++;
      await pending;
    }
    await route.continue();
  });
  const response = page.waitForResponse(
    (pendingResponse) =>
      pendingResponse.request().method() === 'PATCH' &&
      pendingResponse.url().includes('/api/content-entries/'),
  );
  await dialog.getByRole('button', { name: 'Publish changes' }).click();
  await expect(
    dialog.getByRole('button', { name: 'Publishing…' }),
  ).toBeDisabled();
  release();
  expect((await response).status()).toBe(200);
  await expect(dialog).toHaveCount(0);
  expect(writes).toBe(1);
  await expect(
    page.getByRole('button', { name: 'Edit Retained draft', exact: true }),
  ).toBeVisible();
});
it('Escape cancels a draft and restores its opener without saving', async ({
  page,
}) => {
  await login(page, false, '/cms/bio');
  const origin = page.getByRole('button', { name: 'Add chapter', exact: true });
  await origin.click();
  await page
    .getByRole('dialog')
    .getByLabel(/^Heading/)
    .fill('Cancelled chapter');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(origin).toBeFocused();
  await origin.click();
  await expect(page.getByRole('dialog').getByLabel(/^Heading/)).toHaveValue('');
});
it.each(['server', 'network'] as const)((failure) =>
  it(`keeps a CMS draft and allows retry after ${failure} failure`, async ({
    page,
  }) => {
    await login(page, false, '/cms/voiceover');
    await page
      .getByRole('button', { name: 'Edit Tristana', exact: true })
      .click();
    const dialog = page.getByRole('dialog');
    await fill(dialog, { Character: 'Retry draft' });
    await page.route('**/api/content-entries/*/', (route) =>
      route.request().method() !== 'PATCH'
        ? route.continue()
        : failure === 'server'
          ? route.fulfill({
              status: 500,
              json: { detail: 'Temporary failure', fields: {} },
            })
          : route.abort('failed'),
    );
    await dialog.getByRole('button', { name: 'Publish changes' }).click();
    await expect(dialog.getByRole('alert')).toBeVisible();
    await expect(dialog.getByLabel(/^Character/)).toHaveValue('Retry draft');
    const current = await aggregate(page, 'voiceover');
    expect('roles' in current ? current.roles[0]!.title : '').toBe('Tristana');
    await page.unroute('**/api/content-entries/*/');
    const id = 'roles' in current ? current.roles[0]!.id : 0;
    await publish(page, dialog, 'PATCH', '/api/content-entries/' + id + '/');
    await expect(
      page.getByRole('button', { name: 'Edit Retry draft', exact: true }),
    ).toBeVisible();
  }),
);
it('rejects corrupt media without replacing the current image, then associates a verified upload', async ({
  page,
}) => {
  await login(page, false, '/cms/voiceover');
  const before = await aggregate(page, 'voiceover');
  const entry = 'roles' in before ? before.roles[0]! : null;
  expect(entry).not.toBeNull();
  await page
    .getByRole('button', { name: 'Edit Tristana', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await actionResponse(
    page,
    'POST',
    '/api/media-assets/',
    () =>
      dialog.getByLabel('Choose image').setInputFiles({
        name: 'invalid.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('Invalid image bytes'),
      }),
    400,
  );
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(
    dialog.getByRole('img', { name: 'Current image preview' }),
  ).toHaveAttribute('src', entry!.image!.asset.url);
  await dialog
    .getByLabel('Choose image')
    .setInputFiles('portfolio/static/redesign/v1/tristana.jpg');
  await expect(
    dialog.getByRole('img', { name: 'Current image preview' }),
  ).toHaveAttribute('src', /\/media\/uploads\//);
  await publish(
    page,
    dialog,
    'PATCH',
    '/api/content-entries/' + entry!.id + '/',
  );
  const after = await aggregate(page, 'voiceover');
  expect('roles' in after ? after.roles[0]!.image!.asset.id : 0).not.toBe(
    entry!.image!.asset.id,
  );
});
