/* oxlint-disable no-await-in-loop -- These interactions share one browser and depend on its preceding state. */
import { it, expect, login, aggregate, stablePage } from './fixtures.ts';
it('matches the reviewed redesign across public, selected, CMS, and modal states', async ({
  page,
}) => {
  it.setTimeout(240_000);
  const capture = async (name: string) => {
    await stablePage(page);
    await page.mouse.move(0, 0);
    await expect.soft(page).toHaveScreenshot(name + '.png', { fullPage: true });
  };
  for (const viewport of [
    { name: 'desktop', width: 1728, height: 996 },
    { name: 'mobile', width: 400, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() =>
      sessionStorage.removeItem('ElspethEastmanAuthToken'),
    );
    for (const kind of [
      'home',
      'voiceover',
      'music',
      'streaming',
      'press',
      'bio',
      'login',
    ]) {
      await page.goto(kind === 'home' ? '/' : '/' + kind);
      await capture('redesign-' + viewport.name + '-' + kind);
    }
    for (const [kind, parameter] of [
      ['voiceover', 'role'],
      ['press', 'entry'],
    ] as const) {
      const content = await aggregate(page, kind);
      const rows =
        'roles' in content
          ? content.roles
          : 'entries' in content
            ? content.entries
            : [];
      await page.goto('/' + kind + '?' + parameter + '=' + rows[0]!.id);
      await expect(
        page.getByRole('button', { name: 'Close detail' }),
      ).toBeVisible();
      await capture('redesign-' + viewport.name + '-' + kind + '-selected');
    }
    await page.goto('/');
    await page
      .getByRole('button', { name: 'Send message', exact: true })
      .click();
    await expect(page.getByText('Name is required')).toBeVisible();
    await capture('redesign-' + viewport.name + '-contact-validation');
    await login(page);
    for (const kind of [
      'home',
      'voiceover',
      'music',
      'streaming',
      'press',
      'bio',
    ]) {
      await page.goto('/cms' + (kind === 'home' ? '' : '/' + kind));
      await expect(
        page.getByText('Content editor', { exact: true }),
      ).toBeVisible();
      await capture('redesign-' + viewport.name + '-cms-' + kind);
    }
    for (const [kind, button, label] of [
      ['voiceover', 'Edit Tristana', 'role'],
      ['music', 'Edit current practice', 'practice'],
      ['press', 'Add coverage', 'coverage'],
      ['bio', 'Add chapter', 'chapter'],
    ] as const) {
      await page.goto('/cms/' + kind);
      await page
        .getByRole('button', { name: button, exact: true })
        .first()
        .click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await capture('redesign-' + viewport.name + '-editor-' + label);
      await page.keyboard.press('Escape');
    }
  }
});
