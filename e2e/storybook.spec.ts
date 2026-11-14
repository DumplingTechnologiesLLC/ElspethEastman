import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const index = JSON.parse(
  readFileSync('storybook-static/index.json', 'utf8'),
) as { entries: Record<string, { id: string; type: string }> };
for (const story of Object.values(index.entries).filter(
  (entry) => entry.type === 'story',
)) {
  test(`isolated Storybook ${story.id}`, async ({ page }) => {
    const errors: string[] = [];
    const apiRequests: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.startsWith('/api/'))
        apiRequests.push(request.url());
    });
    await page.route('https://**/*', (route) =>
      route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"/>',
      }),
    );
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await expect(page.locator('#storybook-root')).not.toBeEmpty();
    await expect(page.locator('.sb-errordisplay')).not.toBeVisible();
    expect(errors).toEqual([]);
    expect(apiRequests).toEqual([]);
  });
}
