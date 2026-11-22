import {
  it,
  expect,
  login,
  aggregate,
  actionResponse,
  database,
  stablePage,
} from './fixtures.ts';
it('keeps cleared browser credentials cleared across fresh page loads', async ({
  page,
}) => {
  await login(page);
  await page.evaluate(() =>
    sessionStorage.removeItem('ElspethEastmanAuthToken'),
  );
  await page.goto('/');
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('ElspethEastmanAuthToken'),
    ),
  ).toBeNull();
  await stablePage(page);
  await expect(page.getByText('Editor signed in', { exact: true })).toHaveCount(
    0,
  );
});
it('validates required credentials and keeps failed logins outside CMS', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByText('Username is required')).toBeVisible();
  await expect(page.getByLabel(/^Username/)).toBeFocused();
  await page.getByLabel(/^Username/).fill('e2e-editor');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByText('Password is required')).toBeVisible();
  await page.getByLabel(/^Password/).fill('incorrect-password');
  await actionResponse(
    page,
    'POST',
    '/api/v2/session/login/',
    () => page.getByLabel(/^Password/).press('Enter'),
    400,
  );
  await expect(
    page.getByRole('alert').filter({ hasText: 'Bad login' }).last(),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('ElspethEastmanAuthToken'),
    ),
  ).toBeNull();
});
it('retains a selected CMS return location through login, reload, public mode, and logout', async ({
  page,
}) => {
  const content = await aggregate(page, 'voiceover');
  const id = 'roles' in content ? content.roles[0]!.id : 0;
  const destination = '/cms/voiceover?role=' + id + '#roles';
  await page.goto(destination);
  await expect(page).toHaveURL(
    '/login?returnTo=' + encodeURIComponent(destination),
  );
  await page.getByLabel(/^Username/).fill('e2e-editor');
  await page.getByLabel(/^Password/).fill('e2e-only-password');
  await page.getByLabel(/^Password/).press('Enter');
  await expect(
    page.getByRole('button', { name: 'Close detail' }),
  ).toBeVisible();
  await expect(page).toHaveURL(destination);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Close detail' }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'View public page', exact: true })
    .click();
  await expect(page).toHaveURL('/voiceover?role=' + id + '#roles');
  await page.getByRole('link', { name: 'Edit page', exact: true }).click();
  await expect(page).toHaveURL(destination);
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  await expect(page).toHaveURL('/login');
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem('ElspethEastmanAuthToken'),
    ),
  ).toBeNull();
});
it('expires a rejected CMS mutation and returns to the same page after reauthentication', async ({
  page,
}) => {
  await login(page, false, '/cms/voiceover');
  await page
    .getByRole('button', { name: 'Edit Tristana', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(/^Character/).fill('Expired edit');
  database('expire-tokens');
  await dialog.getByRole('button', { name: 'Publish changes' }).click();
  await expect(page).toHaveURL('/login?returnTo=%2Fcms%2Fvoiceover');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByLabel(/^Username/).fill('e2e-editor');
  await page.getByLabel(/^Password/).fill('e2e-only-password');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Edit Tristana', exact: true }),
  ).toBeVisible();
});

it('keeps native release anchors when switching public and CMS modes', async ({
  page,
}) => {
  await login(page, false, '/cms/music');
  await page
    .getByRole('link', { name: 'Explore the music', exact: true })
    .click();
  await expect(page).toHaveURL('/cms/music#releases');
  await page
    .getByRole('link', { name: 'View public page', exact: true })
    .click();
  await expect(page).toHaveURL('/music#releases');
});
