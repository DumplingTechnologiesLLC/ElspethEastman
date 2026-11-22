import { NEW_PROJECT_ID } from '../../../domain/models/Project';
import {
  NEW_AFFILIATION_ID,
  type Affiliation,
} from '../../../domain/models/Affiliation';
import { getSubmissionAlert } from '../../alerts/getSubmissionAlert';
import { Category } from '../../../domain/models/Category';
import { describe, it, expect, vi } from 'vitest';
import { UIAlertService } from '../UIAlertService';
import { ApiService } from '../ApiService';
import { ContactService } from '../ContactService';
import { SessionService } from '../SessionService';
import { SkillsService } from '../SkillsService';
import { ProjectsService } from '../ProjectsService';
import { ExperienceService } from '../ExperienceService';
import { FooterService } from '../FooterService';
import { toProjectViewModel } from '../../../features/Projects/toProjectViewModel';
import { toProject } from '../../mappers/toProject';
import { normalizeVideoId } from '../../../domain/models/normalizeVideoId';
import {
  fixturePorts,
  fakeApi,
  fakeNotifications,
} from '../../../../../test/fakes';

import type { Errors } from '../../../domain/models/Errors';
import type { ProjectDTO } from '../../dto/ProjectDTO';
import type { SkillsData } from '../../../domain/models/SkillsData';
import type { Experience } from '../../../domain/models/Experience';

import type { FooterData } from '../../../domain/models/FooterData';
const project: ProjectDTO = {
  id: '00000000-0000-4000-8000-000000000001',
  src: 'abc',
  title: 'One',
  uuid: '00000000-0000-4000-8000-000000000001',
};
const experience: Experience = {
  id: '00000000-0000-4000-8000-000000000001',
  credit: 'Voice',
  year: '(2021)',
  tba: false,
  link: 'https://example.invalid',
};
const affiliation: Affiliation = {
  id: '00000000-0000-4000-8000-000000000001',
  affiliation: 'Studio',
  link: 'https://example.invalid',
};
const footer: FooterData = {
  stats: [
    {
      id: '00000000-0000-4000-8000-000000000001',
      value: '10',
      label: 'Credits',
      percent: 70,
    },
  ],
  affiliations: [affiliation],
};
const skills: SkillsData = {
  data: {
    voice_acting: 'Voice',
    streaming: 'Streams',
    game_development: 'Games',
  },
  lookup: {
    voice_acting: 'Voice Acting',
    streaming: 'Streaming',
    game_development: 'Game Development',
  },
};
function reply(data: unknown, status: number | null = 200) {
  return { status, data };
}
const tick = () => new Promise<void>((resolve) => queueMicrotask(resolve));
describe('notifications and API contracts', () => {
  it('publishes immutable snapshots, cancels timers, unsubscribes and disposes', () => {
    const ports = fixturePorts();
    const service = new UIAlertService(ports.clock);
    const listener = vi.fn();
    const stop = service.subscribe(listener);
    service.show({ title: 'A', content: 'B', flavor: 'info' });
    const before = service.getSnapshot();
    service.show({ title: 'C', content: 'D', flavor: 'error' });
    expect(before).toHaveLength(1);
    expect(service.getSnapshot()).toHaveLength(2);
    expect(listener).toHaveBeenCalledTimes(2);
    ports.pending[0]!.callback();
    expect(service.getSnapshot().map((toast) => toast.title)).toEqual(['C']);
    expect(ports.pending[0]!.cancel).toHaveBeenCalledOnce();
    service.dismiss(500);
    stop();
    service.dispose();
    expect(ports.pending[1]!.cancel).toHaveBeenCalledOnce();
  });
  it.each([null, 500, 403, 200, 400])(
    'normalizes transport status %s and announces shared failures',
    async (status) => {
      const notifications = fakeNotifications();
      const http = {
        request: vi.fn(async () => reply({ ok: true }, status)),
      } as unknown as ConstructorParameters<typeof ApiService>[0];
      const service = new ApiService(http, notifications);
      expect((await service.request('/path')).status).toBe(
        [null, 500, 403].includes(status) ? null : status,
      );
      await service.request('/api/v2/contact/', 'POST', {});
      await service.request('/x', 'PATCH', {});
      expect(http.request).toHaveBeenLastCalledWith('/x', 'PATCH', {}, true);
    },
  );
  it.each([200, 400, 404, null, 201])(
    'maps submission status %s to a reusable alert',
    (status) => {
      const alert = getSubmissionAlert(status, {
        404: { title: 'Error', content: 'Gone', flavor: 'error' },
      });
      expect(Boolean(alert)).toBe(
        status === 200 || status === 400 || status === 404,
      );
    },
  );
  it.each([200, 400, 201])(
    'accepts caller-owned alert overrides for %s',
    (status) => {
      const custom = {
        title: 'Custom',
        content: 'Caller message',
        flavor: 'info' as const,
      };
      expect(getSubmissionAlert(status, { [status]: custom })).toEqual(custom);
    },
  );
});
describe('contact submission', () => {
  it('requires fields, clears each error, retains the open dialog on success, and resets on close', async () => {
    const api = fakeApi();
    const notifications = fakeNotifications();
    const service = new ContactService(api, notifications);
    service.show(true);
    await service.submit();
    expect(service.getSnapshot().errors).toEqual({
      name: 'Name is required',
      email: 'Email is required',
      message: 'Message is required',
    });
    service.change('name', 'Visitor');
    await service.submit();
    expect(service.getSnapshot().errors.name).toBeUndefined();
    service.change('email', 'visitor@example.invalid');
    service.change('message', 'Hello');
    api.replies.push(reply({}));
    const pending = service.submit();
    expect(service.getSnapshot().submitting).toBe(true);
    await pending;
    expect(api.request).toHaveBeenCalledWith('/api/v2/contact/', 'POST', {
      name: 'Visitor',
      email: 'visitor@example.invalid',
      message: 'Hello',
    });
    expect(service.getSnapshot()).toMatchObject({
      open: true,
      submitting: false,
      draft: { name: '', email: '', message: '' },
    });
    service.show(false);
    expect(service.getSnapshot().errors).toEqual({});
  });
  it.each([400, null])('retains a failed draft on %s', async (status) => {
    const api = fakeApi();
    const notifications = fakeNotifications();
    const service = new ContactService(api, notifications);
    service.change('name', 'Visitor');
    service.change('email', 'broken');
    service.change('message', 'Hello');
    api.replies.push(reply({ email: ['Invalid'] }, status));
    await service.submit();
    expect(service.getSnapshot().draft.email).toBe('broken');
    expect(service.getSnapshot().submitting).toBe(false);
    if (status === 400)
      expect(service.getSnapshot().errors.email).toEqual(['Invalid']);
  });
  it('handles an empty validation body', async () => {
    const api = fakeApi();
    const service = new ContactService(api, fakeNotifications());
    for (const key of ['name', 'email', 'message'] as const)
      service.change(key, 'X');
    api.replies.push(reply(null, 400));
    await service.submit();
    expect(service.getSnapshot().errors).toEqual({});
  });
});
describe('sessions', () => {
  it('requires credentials, records form errors, delays successful login and logs out', async () => {
    const ports = fixturePorts();
    const notifications = fakeNotifications();
    const service = new SessionService(
      ports.http,
      ports.tokens,
      ports.navigation,
      notifications,
      ports.clock,
    );
    await service.login();
    expect(service.getSnapshot().errors.username).toBe('Username is required');
    service.change('username', 'Editor');
    await service.login();
    expect(service.getSnapshot().errors.password).toBe('Password is required');
    service.change('password', 'Password');
    vi.mocked(ports.http.request).mockResolvedValueOnce(
      reply({ detail: 'Invalid' }, 400),
    );
    await service.login();
    expect(service.getSnapshot().errors.form).toBe('Invalid');
    vi.mocked(ports.http.request).mockResolvedValueOnce(reply({}, 400));
    await service.login();
    expect(service.getSnapshot().errors.form).toBe('');
    vi.mocked(ports.http.request).mockResolvedValueOnce(
      reply({ token: 'abc' }),
    );
    await service.login();
    expect(ports.tokens.read()).toBeNull();
    expect(ports.pending[0]!.milliseconds).toBe(1000);
    vi.mocked(ports.http.request).mockResolvedValueOnce(
      reply({ isAuthenticated: true }),
    );
    ports.pending[0]!.callback();
    await tick();
    expect(ports.tokens.read()).toBe('abc');
    expect(service.getSnapshot().authenticated).toBe(true);
    vi.mocked(ports.http.request).mockResolvedValueOnce(reply({}));
    await service.logout();
    expect(ports.tokens.read()).toBeNull();
    expect(ports.navigation.go).toHaveBeenCalledWith('/login');
  });
  it.each([400, 500])(
    'retains authentication when logout fails with %s',
    async (status) => {
      const ports = fixturePorts();
      ports.tokens.write('abc');
      vi.mocked(ports.http.request).mockResolvedValueOnce(reply(null, status));
      const notifications = fakeNotifications();
      const service = new SessionService(
        ports.http,
        ports.tokens,
        ports.navigation,
        notifications,
        ports.clock,
      );
      await service.logout();
      expect(service.getSnapshot().authenticated).toBe(true);
      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Error',
        content: expect.stringContaining("couldn't log you off"),
        flavor: 'error',
      });
    },
  );
  it('validates on pathname and storage changes, ignores hash changes and cleans subscriptions', async () => {
    const ports = fixturePorts();
    ports.tokens.write('abc');
    vi.mocked(ports.http.request).mockResolvedValue(
      reply({ isAuthenticated: true }),
    );
    const service = new SessionService(
      ports.http,
      ports.tokens,
      ports.navigation,
      fakeNotifications(),
      ports.clock,
    );
    const stop = service.start();
    await tick();
    service.navigate('/#Music');
    expect(ports.http.request).toHaveBeenCalledTimes(1);
    service.navigate('/projects');
    await tick();
    expect(ports.http.request).toHaveBeenCalledTimes(2);
    ports.storageChanged();
    await tick();
    expect(ports.http.request).toHaveBeenCalledTimes(3);
    stop();
  });
  it('expires browser credentials after failed validation without revoking the server token', async () => {
    const ports = fixturePorts();
    ports.tokens.write('abc');
    vi.mocked(ports.http.request).mockResolvedValue(reply(null, null));
    const notifications = fakeNotifications();
    const service = new SessionService(
      ports.http,
      ports.tokens,
      ports.navigation,
      notifications,
      ports.clock,
    );
    const stop = service.start();
    await tick();
    expect(service.getSnapshot().authenticated).toBe(false);
    expect(ports.tokens.read()).toBeNull();
    expect(ports.http.request).not.toHaveBeenCalledWith(
      '/api/v2/session/logout/',
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Session has expired',
      content: 'Please re-log in.',
      flavor: 'error',
    });
    stop();
  });
  it('redirects an anonymous CMS request but allows other anonymous pages', async () => {
    const ports = fixturePorts();
    ports.navigation.go('/cms');
    const service = new SessionService(
      ports.http,
      ports.tokens,
      ports.navigation,
      fakeNotifications(),
      ports.clock,
    );
    const stop = service.start();
    await tick();
    expect(ports.navigation.location()).toBe('/login?returnTo=%2Fcms');
    stop();
  });
  it.each([200, null, 500])(
    'does not authenticate an unsuccessful login %s',
    async (status) => {
      const ports = fixturePorts();
      vi.mocked(ports.http.request).mockResolvedValue(reply({}, status));
      const service = new SessionService(
        ports.http,
        ports.tokens,
        ports.navigation,
        fakeNotifications(),
        ports.clock,
      );
      service.change('username', 'E');
      service.change('password', 'P');
      await service.login();
      expect(ports.tokens.read()).toBeNull();
      expect(service.getSnapshot().submitting).toBe(false);
    },
  );
});
describe('skills', () => {
  it('loads, selects, edits, resets and submits the complete skills record', async () => {
    const api = fakeApi();
    const notifications = fakeNotifications();
    const service = new SkillsService(api, notifications, true);
    api.replies.push(reply(skills));
    await service.load();
    service.select('streaming');
    service.change('New');
    expect(service.getSnapshot().draft.streaming).toBe('New');
    service.reset();
    expect(service.getSnapshot().draft.streaming).toBe('Streams');
    api.replies.push(reply({}));
    await service.save();
    expect(api.request).toHaveBeenLastCalledWith(
      '/api/skills/',
      'PATCH',
      skills.data,
    );
    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Success',
      content: 'Action submitted successfully.',
      flavor: 'success',
    });
  });
  it.each([true, false])(
    'reports a failed skills load in editor=%s',
    async (editor) => {
      const api = fakeApi();
      const notifications = fakeNotifications();
      const service = new SkillsService(api, notifications, editor);
      api.replies.push(reply(null, null));
      await service.load();
      expect(service.getSnapshot().loaded).toBe(true);
      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Error',
        content: editor ? 'Skills failed to load.' : 'Failed to load skills',
        flavor: 'error',
      });
    },
  );
  it.each([
    { voice_acting: ['Required'] },
    { voice_acting: ['Required'], streaming: ['Required'] },
  ])('reports validation labels and retains errors', async (errors: Errors) => {
    const api = fakeApi();
    const notifications = fakeNotifications();
    const service = new SkillsService(api, notifications, true);
    api.replies.push(reply(skills), reply(errors, 400));
    await service.load();
    await service.save();
    expect(service.getSnapshot().errors).toEqual(errors);
    expect(notifications.show).toHaveBeenLastCalledWith({
      title: 'Error',
      content: expect.stringContaining(
        Object.keys(errors).length === 1 ? 'contains errors' : 'contain errors',
      ),
      flavor: 'error',
    });
  });
  it('normalizes an empty validation body', async () => {
    const api = fakeApi();
    const service = new SkillsService(api, fakeNotifications(), true);
    api.replies.push(reply(null, 400));
    await service.save();
    expect(service.getSnapshot().submitting).toBe(false);
  });
});
describe('projects', () => {
  it.each(['latest', 'all', 'editor'] as const)(
    'keeps %s pagination separate from the complete list',
    async (mode) => {
      const api = fakeApi();
      const service = new ProjectsService(
        api,
        fakeNotifications(),
        () => true,
        mode,
      );
      api.replies.push(
        reply(mode === 'latest' ? { data: [project], pages: 2 } : [project]),
      );
      await service.load();
      expect(service.getSnapshot().projects).toEqual([project]);
      if (mode === 'latest') {
        api.replies.push(
          reply({
            data: [{ ...project, id: '00000000-0000-4000-8000-000000000002' }],
            pages: 2,
          }),
        );
        await service.nextPage();
        expect(service.getSnapshot().projects).toHaveLength(2);
      }
    },
  );
  it.each(['latest', 'all'] as const)(
    'reports a failed %s load',
    async (mode) => {
      const api = fakeApi();
      const notifications = fakeNotifications();
      const service = new ProjectsService(api, notifications, () => true, mode);
      api.replies.push(reply(null, null));
      await service.load();
      expect(service.getSnapshot().loaded).toBe(true);
      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Error',
        content: 'Failed to load projects',
        flavor: 'error',
      });
    },
  );
  it('normalizes video URLs for new drafts while preserving existing form input', async () => {
    const api = fakeApi();
    const service = new ProjectsService(
      api,
      fakeNotifications(),
      () => true,
      'editor',
    );
    api.replies.push(reply([project]));
    await service.load();
    service.show(true);
    service.change(NEW_PROJECT_ID, 'title', 'New');
    service.change(
      NEW_PROJECT_ID,
      'src',
      'https://youtube.com/watch?v=def&x=1',
    );
    expect(service.getSnapshot().draft.src).toBe('def');
    service.change(
      '00000000-0000-4000-8000-000000000001',
      'src',
      'https://youtube.com/embed/abc',
    );
    expect(service.getSnapshot().projects[0]!.src).toContain('embed/');
    service.reset('00000000-0000-4000-8000-000000000001');
    expect(service.getSnapshot().projects[0]).toEqual(project);
    service.reset(NEW_PROJECT_ID);
    expect(service.getSnapshot().draft.title).toBe('');
    service.show(false);
    expect(service.getSnapshot().open).toBe(false);
    expect(normalizeVideoId('https://youtube.com/embed/abc')).toBe('abc');
    expect(normalizeVideoId('raw')).toBe('raw');
    expect(toProjectViewModel(toProject(project)).thumbnail).toContain('/abc/');
  });
  it('creates, updates and resets a saved project', async () => {
    const api = fakeApi();
    const service = new ProjectsService(
      api,
      fakeNotifications(),
      () => true,
      'editor',
    );
    api.replies.push(reply([project]));
    await service.load();
    service.show(true);
    service.change(NEW_PROJECT_ID, 'title', 'New');
    api.replies.push(
      reply({
        project: {
          ...project,
          id: '00000000-0000-4000-8000-000000000002',
          title: 'New',
        },
      }),
    );
    await service.save(NEW_PROJECT_ID);
    expect(service.getSnapshot().projects).toHaveLength(2);
    expect(service.getSnapshot().open).toBe(false);
    service.change('00000000-0000-4000-8000-000000000001', 'title', 'Edited');
    api.replies.push(reply({ ...project, title: 'Edited' }));
    await service.save('00000000-0000-4000-8000-000000000001');
    service.change('00000000-0000-4000-8000-000000000001', 'title', 'Unsaved');
    service.reset('00000000-0000-4000-8000-000000000001');
    expect(service.getSnapshot().projects[0]!.title).toBe('Edited');
    await service.save('00000000-0000-4000-8000-000000000384');
    expect(service.getSnapshot().busy).toEqual([]);
  });
  it.each([NEW_PROJECT_ID, '00000000-0000-4000-8000-000000000001'])(
    'retains project validation errors for id %s and blocks save-all',
    async (id) => {
      const api = fakeApi();
      const notifications = fakeNotifications();
      const service = new ProjectsService(
        api,
        notifications,
        () => true,
        'editor',
      );
      api.replies.push(reply([project]));
      await service.load();
      const errors = { title: ['Required'] };
      api.replies.push(
        reply(
          id === NEW_PROJECT_ID ? { id: NEW_PROJECT_ID, errors } : errors,
          400,
        ),
      );
      await service.save(id);
      expect(service.getSnapshot().errors[id]).toEqual(errors);
      await service.saveAll();
      expect(notifications.show).toHaveBeenLastCalledWith({
        title: 'Error',
        content: 'Please resolve errors before submitting.',
        flavor: 'error',
      });
    },
  );
  it.each([200, 400, null])('handles bulk-save status %s', async (status) => {
    const api = fakeApi();
    const service = new ProjectsService(
      api,
      fakeNotifications(),
      () => true,
      'editor',
    );
    api.replies.push(reply([project]));
    await service.load();
    api.replies.push(
      reply(
        {
          message: 'Saved',
          id: '00000000-0000-4000-8000-000000000001',
          errors: { title: ['Required'] },
        },
        status,
      ),
    );
    await service.saveAll();
    expect(service.getSnapshot().busy).toEqual([]);
    if (status === 400)
      expect(
        service.getSnapshot().errors['00000000-0000-4000-8000-000000000001'],
      ).toEqual({ title: ['Required'] });
  });
  it('uses the bulk error text and tolerates a missing body', async () => {
    const api = fakeApi();
    const notifications = fakeNotifications();
    const service = new ProjectsService(
      api,
      notifications,
      () => true,
      'editor',
    );
    api.replies.push(
      reply(
        {
          error: 'Broken',
          id: '00000000-0000-4000-8000-000000000001',
          errors: {},
        },
        400,
      ),
      reply({}, 200),
      reply(null, 400),
      reply(null, null),
    );
    await service.saveAll();
    expect(notifications.show).toHaveBeenLastCalledWith({
      title: 'Error',
      content: 'Broken',
      flavor: 'success',
    });
    await service.saveAll();
    await service.save(NEW_PROJECT_ID);
    await service.save(NEW_PROJECT_ID);
    expect(service.getSnapshot().busy).toEqual([]);
  });
  it.each([true, false])('honors delete confirmation=%s', async (confirmed) => {
    const api = fakeApi();
    const service = new ProjectsService(
      api,
      fakeNotifications(),
      () => confirmed,
      'editor',
    );
    api.replies.push(reply([project]));
    await service.load();
    if (confirmed) api.replies.push(reply({}));
    await service.remove('00000000-0000-4000-8000-000000000001');
    expect(service.getSnapshot().projects).toHaveLength(confirmed ? 0 : 1);
  });
  it('retains a project when deletion fails', async () => {
    const api = fakeApi();
    const service = new ProjectsService(
      api,
      fakeNotifications(),
      () => true,
      'editor',
    );
    api.replies.push(reply([project]), reply(null, null));
    await service.load();
    await service.remove('00000000-0000-4000-8000-000000000001');
    expect(service.getSnapshot().projects).toEqual([project]);
  });
});
describe('experience', () => {
  it('loads category groups, edits a formatted year, clears errors and resets a draft', async () => {
    const api = fakeApi();
    const groups = Object.fromEntries(
      Object.values(Category).map((category) => [category, [experience]]),
    );
    const service = new ExperienceService(
      api,
      fakeNotifications(),
      () => true,
      2026,
    );
    api.replies.push(reply(groups));
    await service.load();
    expect(service.getSnapshot().groups).toEqual(groups);
    service.edit(Category.VoiceCredits, experience);
    expect(service.getSnapshot().draft.year).toBe('2021');
    service.change('credit', 'Changed');
    service.reset();
    expect(service.getSnapshot().draft.credit).toBe('Voice');
    service.edit(Category.VoiceCredits, {
      ...experience,
      year: '(TBA)',
      link: null,
    });
    expect(service.getSnapshot().draft).toMatchObject({ year: '', link: '' });
    service.close();
    expect(service.getSnapshot().open).toBe(false);
  });
  it('reports a failed load', async () => {
    const api = fakeApi();
    const notifications = fakeNotifications();
    const service = new ExperienceService(api, notifications, () => true, 2026);
    api.replies.push(reply(null, null));
    await service.load();
    expect(service.getSnapshot().loaded).toBe(true);
    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Error',
      content: 'Failed to load experience list',
      flavor: 'error',
    });
  });
  it('creates and then updates the selected category without mutating other records', async () => {
    const api = fakeApi();
    const service = new ExperienceService(
      api,
      fakeNotifications(),
      () => true,
      2026,
    );
    service.edit(Category.VoiceCredits);
    service.change('credit', 'Voice');
    service.change('year', '');
    api.replies.push(reply({ object: experience }));
    await service.save();
    expect(api.request).toHaveBeenLastCalledWith(
      '/api/experience/',
      'POST',
      expect.objectContaining({ year: null }),
    );
    service.edit(Category.VoiceCredits, experience);
    service.change('year', '2026');
    api.replies.push(reply({ object: { ...experience, year: '(2026)' } }));
    await service.save();
    expect(service.getSnapshot().groups[Category.VoiceCredits][0]!.year).toBe(
      '(2026)',
    );
    service.edit(Category.VoiceCredits, {
      ...experience,
      id: '00000000-0000-4000-8000-000000000002',
    });
    api.replies.push(
      reply({
        object: { ...experience, id: '00000000-0000-4000-8000-000000000002' },
      }),
    );
    await service.save();
    expect(service.getSnapshot().groups[Category.VoiceCredits]).toHaveLength(1);
  });
  it.each([400, null])('retains failed draft status %s', async (status) => {
    const api = fakeApi();
    const service = new ExperienceService(
      api,
      fakeNotifications(),
      () => true,
      2026,
    );
    service.edit(Category.MusicGames);
    api.replies.push(reply({ credit: ['Required'] }, status));
    await service.save();
    expect(service.getSnapshot().open).toBe(true);
    if (status === 400) {
      expect(service.getSnapshot().errors.credit).toEqual(['Required']);
      service.change('credit', 'New');
      expect(service.getSnapshot().errors.credit).toBeUndefined();
    }
  });
  it.each([true, false])(
    'deletes only after confirmation %s, retaining the legacy optimistic removal',
    async (confirmed) => {
      const api = fakeApi();
      const service = new ExperienceService(
        api,
        fakeNotifications(),
        () => confirmed,
        2026,
      );
      api.replies.push(
        reply({
          [Category.VoiceCredits]: [
            experience,
            { ...experience, id: '00000000-0000-4000-8000-000000000002' },
          ],
          [Category.MusicGames]: [],
          [Category.MusicMiscellaneous]: [],
          [Category.StreamingCredits]: [],
        }),
      );
      await service.load();
      if (confirmed) api.replies.push(reply(null, null));
      await service.remove(
        Category.VoiceCredits,
        '00000000-0000-4000-8000-000000000001',
      );
      expect(service.getSnapshot().groups[Category.VoiceCredits]).toHaveLength(
        confirmed ? 1 : 2,
      );
    },
  );
  it('handles an empty error body', async () => {
    const api = fakeApi();
    const service = new ExperienceService(
      api,
      fakeNotifications(),
      () => true,
      2026,
    );
    api.replies.push(reply(null, 400));
    await service.save();
    expect(service.getSnapshot().errors).toEqual({});
  });
});
describe('footer editor', () => {
  it('loads facts and affiliations, edits, resets, saves and preserves other records', async () => {
    const api = fakeApi();
    const service = new FooterService(api, fakeNotifications(), () => true);
    api.replies.push(
      reply({
        ...footer,
        affiliations: [
          affiliation,
          { ...affiliation, id: '00000000-0000-4000-8000-000000000002' },
        ],
      }),
    );
    await service.load();
    service.change(
      '00000000-0000-4000-8000-000000000001',
      'affiliation',
      'Changed',
    );
    expect(service.getSnapshot().data.affiliations[0]!.affiliation).toBe(
      'Changed',
    );
    service.reset('00000000-0000-4000-8000-000000000001');
    expect(service.getSnapshot().data.affiliations[0]).toEqual(affiliation);
    service.change('00000000-0000-4000-8000-000000000001', 'link', 'New');
    api.replies.push(reply({ ...affiliation, link: 'New' }));
    await service.save('00000000-0000-4000-8000-000000000001');
    expect(service.getSnapshot().cached[0]!.link).toBe('New');
    await service.save('00000000-0000-4000-8000-0000000003e7');
    expect(service.getSnapshot().busy).toEqual([]);
  });
  it('creates from a reset draft and immediately closes the modal even on validation failure', async () => {
    const api = fakeApi();
    const service = new FooterService(api, fakeNotifications(), () => true);
    service.show(true);
    service.change(NEW_AFFILIATION_ID, 'affiliation', 'Draft');
    service.reset(NEW_AFFILIATION_ID);
    expect(service.getSnapshot().draft.affiliation).toBe('');
    service.change(NEW_AFFILIATION_ID, 'affiliation', 'New');
    api.replies.push(reply({ affiliation: ['Required'] }, 400));
    const pending = service.save(NEW_AFFILIATION_ID);
    expect(service.getSnapshot().open).toBe(false);
    await pending;
    expect(service.getSnapshot().errors[NEW_AFFILIATION_ID]).toEqual({
      affiliation: ['Required'],
    });
    service.show(true);
    expect(service.getSnapshot().draft.affiliation).toBe('');
    api.replies.push(reply(affiliation));
    await service.save(NEW_AFFILIATION_ID);
    expect(service.getSnapshot().data.affiliations).toEqual([affiliation]);
  });
  it('reports a failed load and retains invalid existing fields until reset', async () => {
    const api = fakeApi();
    const notifications = fakeNotifications();
    const service = new FooterService(api, notifications, () => true);
    api.replies.push(
      reply(null, null),
      reply(footer),
      reply({ link: ['Invalid'] }, 400),
    );
    await service.load();
    expect(notifications.show).toHaveBeenLastCalledWith({
      title: 'Error',
      content: 'Failed to load footer details',
      flavor: 'error',
    });
    await service.load();
    await service.save('00000000-0000-4000-8000-000000000001');
    service.change('00000000-0000-4000-8000-000000000001', 'link', 'Fixed');
    expect(
      service.getSnapshot().errors['00000000-0000-4000-8000-000000000001']!
        .link,
    ).toBeUndefined();
    service.reset('00000000-0000-4000-8000-000000000001');
    expect(
      service.getSnapshot().errors['00000000-0000-4000-8000-000000000001'],
    ).toEqual({});
  });
  it.each([200, null])('handles deletion status %s', async (status) => {
    const api = fakeApi();
    const service = new FooterService(api, fakeNotifications(), () => true);
    api.replies.push(reply(footer), reply({}, status));
    await service.load();
    await service.remove('00000000-0000-4000-8000-000000000001');
    expect(service.getSnapshot().data.affiliations).toHaveLength(
      status === 200 ? 0 : 1,
    );
  });
  it('respects a canceled delete', async () => {
    const api = fakeApi();
    const service = new FooterService(api, fakeNotifications(), () => false);
    await service.remove('00000000-0000-4000-8000-000000000001');
    expect(api.request).not.toHaveBeenCalled();
  });
  it('handles an empty error body', async () => {
    const api = fakeApi();
    const service = new FooterService(api, fakeNotifications(), () => true);
    api.replies.push(reply(null, 400));
    await service.save(NEW_AFFILIATION_ID);
    expect(service.getSnapshot().errors[NEW_AFFILIATION_ID]).toEqual({});
  });
});

it.each([
  ['/', false, 'home'],
  ['/cms', true, 'cms'],
  ['/cms', false, 'login'],
  ['/login', false, 'login'],
  ['/projects', false, 'projects'],
] as const)(
  'selects the domain page for %s authenticated=%s',
  (path, authenticated, page) => {
    const ports = fixturePorts();
    ports.navigation.go(path);
    if (authenticated) ports.tokens.write('token');
    const service = new SessionService(
      ports.http,
      ports.tokens,
      ports.navigation,
      fakeNotifications(),
      ports.clock,
    );
    expect(service.getPage()).toBe(page);
  },
);
it('bulk-saves edited project fields after clearing their validation errors', async () => {
  const api = fakeApi();
  const service = new ProjectsService(
    api,
    fakeNotifications(),
    () => true,
    'editor',
  );
  api.replies.push(reply([project]), reply({ message: 'Saved' }));
  await service.load();
  service.change('00000000-0000-4000-8000-000000000001', 'title', 'Edited');
  await service.saveAll();
  expect(api.request).toHaveBeenLastCalledWith(
    '/api/projects/list/batch_update/',
    'PATCH',
    [{ ...project, title: 'Edited' }],
  );
});
it('preserves login network-error notifications', async () => {
  const ports = fixturePorts();
  const notifications = fakeNotifications();
  const service = new SessionService(
    ports.http,
    ports.tokens,
    ports.navigation,
    notifications,
    ports.clock,
  );
  service.change('username', 'Editor');
  service.change('password', 'Password');
  vi.mocked(ports.http.request).mockResolvedValueOnce(reply(null, null));
  await service.login();
  expect(notifications.show).toHaveBeenCalledWith({
    title: 'Error',
    content: 'Network error',
    flavor: 'error',
  });
});
it('preserves browser logout after a transport failure while the server request is unfulfilled', async () => {
  const ports = fixturePorts();
  ports.tokens.write('abc');
  const notifications = fakeNotifications();
  const service = new SessionService(
    ports.http,
    ports.tokens,
    ports.navigation,
    notifications,
    ports.clock,
  );
  vi.mocked(ports.http.request).mockResolvedValueOnce(reply(null, null));
  await service.logout();
  expect(ports.tokens.read()).toBeNull();
  expect(notifications.show).toHaveBeenCalledWith({
    title: 'Error',
    content: 'Network error',
    flavor: 'error',
  });
  expect(notifications.show).toHaveBeenCalledWith({
    title: 'Goodbye!',
    content: 'Successfully logged off',
    flavor: 'success',
  });
});
it('leaves skills unchanged when the API has already handled a failed submission', async () => {
  const api = fakeApi();
  const notifications = fakeNotifications();
  const service = new SkillsService(api, notifications, true);
  service.change('Unsaved draft');
  api.replies.push(reply(null, null));
  await service.save();
  expect(service.getSnapshot().draft.voice_acting).toBe('Unsaved draft');
  expect(service.getSnapshot().submitting).toBe(false);
  expect(notifications.show).not.toHaveBeenCalled();
});
it('reports a missing experience and preserves the existing optimistic local removal', async () => {
  const api = fakeApi();
  const notifications = fakeNotifications();
  const service = new ExperienceService(api, notifications, () => true, 2026);
  api.replies.push(
    reply({
      ...service.getSnapshot().groups,
      [Category.VoiceCredits]: [
        experience,
        { ...experience, id: '00000000-0000-4000-8000-000000000002' },
      ],
    }),
  );
  await service.load();
  api.replies.push(reply(null, 404));
  await service.remove(
    Category.VoiceCredits,
    '00000000-0000-4000-8000-000000000001',
  );
  expect(service.getSnapshot().groups[Category.VoiceCredits]).toEqual([
    { ...experience, id: '00000000-0000-4000-8000-000000000002' },
  ]);
  expect(notifications.show).toHaveBeenCalledWith({
    title: 'Error',
    content: 'Experience no longer exists. Perhaps it was already deleted?',
    flavor: 'error',
  });
});
it('preserves the existing new-affiliation form closure after a handled submission failure', async () => {
  const api = fakeApi();
  const notifications = fakeNotifications();
  const service = new FooterService(api, notifications, () => true);
  service.show(true);
  service.change(NEW_AFFILIATION_ID, 'affiliation', 'Unsaved affiliation');
  api.replies.push(reply(null, null));
  await service.save(NEW_AFFILIATION_ID);
  expect(service.getSnapshot().data.affiliations).toEqual([]);
  expect(service.getSnapshot().draft.affiliation).toBe('Unsaved affiliation');
  expect(service.getSnapshot().open).toBe(false);
  expect(service.getSnapshot().busy).toEqual([]);
  expect(notifications.show).not.toHaveBeenCalled();
});
