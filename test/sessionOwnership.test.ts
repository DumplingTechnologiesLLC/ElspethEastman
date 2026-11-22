import { expect, it, vi } from 'vitest';
import { fixturePorts } from './fakes';
import { aHomeDTO, aPageDTO } from './contentFixtures';
import { BrowserHttp } from '../frontend/src/platform/BrowserHttp';

const homeId = aPageDTO('home').id;

it.each(['save', 'page', 'site', 'upload'] as const)(
  'keeps a new login when an older %s request completes with 403',
  async (operation) => {
    const ports = fixturePorts();
    ports.tokens.write('old-token');
    ports.navigation.go('/cms');
    let release!: () => void;
    const oldResponse = new Promise<Response>((resolve) => {
      release = () =>
        resolve(new Response('{"detail":"Expired"}', { status: 403 }));
    });
    let intercept = true;
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async (path, init) => {
        if (path === '/api/v2/session/')
          return Response.json({
            isAuthenticated: Boolean(ports.tokens.read()),
          });
        if (path === '/api/v2/session/logout/') return Response.json({});
        if (path === '/api/v2/session/login/')
          return Response.json({ token: 'new-token' });
        if (path === '/api/v2/media/assets/')
          return intercept
            ? oldResponse
            : new Response('{"detail":"Expired"}', { status: 403 });
        if (path === '/api/v2/site/')
          return operation === 'site' && intercept
            ? oldResponse
            : Response.json({ pages: [aPageDTO('home')] });
        if (path === `/api/v2/pages/${homeId}/`) {
          if (init?.method === 'PATCH')
            return intercept
              ? oldResponse
              : new Response('{"detail":"Expired"}', { status: 403 });
          return operation === 'page' && intercept
            ? oldResponse
            : Response.json(aHomeDTO());
        }
        throw new Error(`Unexpected request: ${String(path)}`);
      });
    const http = new BrowserHttp(
      fetcher,
      () => 'csrftoken=review-csrf',
      ports.tokens,
    );
    ports.http.request = http.request.bind(http);
    const services = ports.services();
    const stop = services.session.start();
    const page = services.page(homeId);
    if (operation === 'save') await page.load();
    const upload = () =>
      services.media.upload({
        file: new File(['image'], 'portrait.png', { type: 'image/png' }),
        credit: '',
        sourceUrl: '',
      });
    const first =
      operation === 'upload'
        ? upload()
        : operation === 'save'
          ? page.metadata({ title: 'Pending save' })
          : operation === 'page'
            ? page.load()
            : services.site.load();
    await vi.waitFor(() =>
      expect(fetcher).toHaveBeenCalledWith(
        operation === 'site'
          ? '/api/v2/site/'
          : operation === 'upload'
            ? '/api/v2/media/assets/'
            : `/api/v2/pages/${homeId}/`,
        operation === 'save' || operation === 'upload'
          ? expect.objectContaining({
              headers: expect.objectContaining({
                Authorization: 'Token old-token',
              }),
            })
          : undefined,
      ),
    );
    await services.session.logout();
    services.session.change('username', 'Editor');
    services.session.change('password', 'Password');
    await services.session.login();
    ports.pending.find((item) => item.milliseconds === 1000)!.callback();
    await vi.waitFor(() =>
      expect(services.session.getSnapshot().authenticated).toBe(true),
    );
    expect(ports.tokens.read()).toBe('new-token');
    const shared =
      operation === 'page'
        ? page.load()
        : operation === 'site'
          ? services.site.load()
          : Promise.resolve();
    release();
    await Promise.all([first, shared]);
    expect(ports.tokens.read()).toBe('new-token');
    expect(services.session.getSnapshot().authenticated).toBe(true);
    expect(ports.navigation.location()).toBe('/cms');
    intercept = false;
    if (operation === 'save' || operation === 'upload') {
      if (operation === 'upload') await upload();
      else await page.metadata({ title: 'Current save' });
      expect(ports.tokens.read()).toBeNull();
      expect(ports.navigation.location()).toBe('/login?returnTo=%2Fcms');
    }
    stop();
    services.dispose();
  },
);
