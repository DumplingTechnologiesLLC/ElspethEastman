const { test, expect, login, stablePage } = require('./fixtures.cjs');

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  for (const [name, path] of [['home', '/'], ['projects', '/projects'], ['login', '/login'], ['cms', '/cms']]) {
    test(`${viewport.name} ${name} baseline`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      if (name === 'cms') await login(page);
      else await page.goto(path);
      if (name === 'home') {
        await expect(page.getByText('Voice acting fixture: characters, narration, and animation.')).toBeVisible();
        await expect(page.locator('img[alt^="Select this thumbnail"]')).toHaveCount(4);
      }
      if (name === 'projects') await expect(page.locator('img[alt^="Select this thumbnail"]')).toHaveCount(6);
      await stablePage(page);
      await expect(page).toHaveScreenshot(`${viewport.name}-${name}.png`, { fullPage: true });
    });
  }

  test(`${viewport.name} contact form and validation baseline`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await page.getByRole('button', { name: 'Get in touch', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: /Contact Me/ });
    await expect(dialog).toHaveCSS('opacity', '1');
    await stablePage(page);
    await expect(page).toHaveScreenshot(`${viewport.name}-contact.png`);
    await dialog.getByRole('button', { name: 'Get in touch' }).click();
    await expect(dialog.getByText('Name is required')).toBeVisible();
    await expect(page).toHaveScreenshot(`${viewport.name}-contact-validation.png`);
  });
}

for (const [name, button, title] of [
  ['project', 'Add New Project', 'Add new Project'],
  ['experience', 'Add new credit', 'Experience Form'],
  ['affiliation', 'Create new affiliation', 'Add new Affiliation'],
]) {
  test(`desktop ${name} editor baseline`, async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: button, exact: true }).first().click();
    const dialog = page.getByRole('dialog', { name: title, exact: true });
    await expect(dialog).toHaveCSS('opacity', '1');
    await stablePage(page);
    await expect(page).toHaveScreenshot(`desktop-${name}-editor.png`);
  });
}
