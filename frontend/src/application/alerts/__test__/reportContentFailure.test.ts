import { expect, it, vi } from 'vitest';
import { fakeNotifications } from '../../../../../test/fakes';
import { reportContentFailure } from '../reportContentFailure';

it('expires forbidden sessions, leaves form validation inline, and reports other failures', () => {
  const alerts = fakeNotifications();
  const session = { expire: vi.fn() };
  reportContentFailure(
    { status: 403, detail: 'Forbidden', fields: {} },
    alerts,
    session,
    '/cms/press?entry=00000000-0000-4000-8000-000000000028',
    7,
  );
  expect(session.expire).toHaveBeenCalledExactlyOnceWith(
    '/cms/press?entry=00000000-0000-4000-8000-000000000028',
    7,
  );
  reportContentFailure(
    { status: 400, detail: 'Invalid', fields: { title: ['Required'] } },
    alerts,
    session,
    '/cms',
    7,
  );
  expect(alerts.show).not.toHaveBeenCalled();
  reportContentFailure(
    { status: null, detail: 'Offline', fields: {} },
    alerts,
    session,
    '/cms',
    7,
  );
  expect(alerts.show).toHaveBeenLastCalledWith({
    title: 'Could not save changes',
    content: 'Offline',
    flavor: 'error',
  });
  reportContentFailure(
    {
      status: 400,
      detail: 'Invalid order',
      fields: { orderedIds: ['Include every member'] },
    },
    alerts,
    session,
    '/cms',
    7,
    true,
  );
  expect(alerts.show).toHaveBeenLastCalledWith({
    title: 'Could not save changes',
    content: 'Include every member',
    flavor: 'error',
  });
  reportContentFailure(
    { status: 400, detail: 'Invalid order', fields: {} },
    alerts,
    session,
    '/cms',
    7,
    true,
  );
  expect(alerts.show).toHaveBeenLastCalledWith({
    title: 'Could not save changes',
    content: 'Invalid order',
    flavor: 'error',
  });
});
