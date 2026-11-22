// @vitest-environment node
import { it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PortfolioWired } from '../frontend/src/features/Portfolio/Portfolio.wired';
import { fixturePorts } from './fakes';
import { aHomeDTO, aCopyDTO } from './contentFixtures';

async function preloadRequest(value: string, editor: boolean) {
  const ports = fixturePorts();
  if (editor) {
    ports.tokens.write('request-token');
    ports.navigation.go('/cms');
  }
  const home = aHomeDTO({ copy: [aCopyDTO({ value })] });
  vi.mocked(ports.http.request).mockImplementation(async (path) => {
    if (path === '/api/v2/site/')
      return { status: 200, data: { pages: [home.page] } } as never;
    if (path === '/api/v2/pages/' + home.page.id + '/')
      return { status: 200, data: home } as never;
    throw new Error('Unexpected request: ' + path);
  });
  const services = ports.services();
  await services.site.load();
  await services.page(home.page.id).load();
  vi.mocked(ports.http.request).mockClear();
  return { ports, services };
}

it('renders the redesigned shell without DOM globals or starting request effects', () => {
  const request = fixturePorts();
  const services = request.services();
  expect(renderToString(<PortfolioWired services={services} />)).toContain(
    'Loading…',
  );
  expect(request.http.request).not.toHaveBeenCalled();
  expect(request.navigation.listen).not.toHaveBeenCalled();
  expect(request.tokens.listen).not.toHaveBeenCalled();
  services.dispose();
});

it('renders preloaded public and CMS requests without sharing content, credentials, or effects', async () => {
  const anonymous = await preloadRequest('Public request content', false);
  const editor = await preloadRequest('Editor request content', true);
  const first = renderToString(
    <PortfolioWired services={anonymous.services} />,
  );
  const second = renderToString(<PortfolioWired services={editor.services} />);
  expect(first).toContain('Public request content');
  expect(first).not.toContain('Editor request content');
  expect(first).not.toContain('Content editor');
  expect(second).toContain('Editor request content');
  expect(second).not.toContain('Public request content');
  expect(second).toContain('Content editor');
  expect(anonymous.ports.tokens.read()).toBeNull();
  expect(editor.ports.tokens.read()).toBe('request-token');
  for (const { ports, services } of [anonymous, editor]) {
    expect(ports.http.request).not.toHaveBeenCalled();
    expect(ports.navigation.listen).not.toHaveBeenCalled();
    expect(ports.tokens.listen).not.toHaveBeenCalled();
    services.dispose();
  }
});
