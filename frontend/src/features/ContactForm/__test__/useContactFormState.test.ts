import { expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { mockServices } from '../../../../../test/mockServices';
import { useContactFormState } from '../useContactFormState';
it('adapts retained contact state and normalizes server error arrays for field presentation', () => {
  const { services, contact } = mockServices();
  const hook = renderHook(useContactFormState, { initialProps: { services } });
  expect(hook.result.current.change).toBe(contact.change);
  expect(hook.result.current.submit).toBe(contact.submit);
  act(() =>
    contact.publish({
      ...contact.getSnapshot(),
      errors: { name: 'Required', email: ['Invalid', 'Check address'] },
      submitting: true,
    }),
  );
  expect(hook.result.current).toMatchObject({
    errors: { name: 'Required', email: 'Invalid Check address' },
    submitting: true,
  });
  hook.unmount();
  expect(contact.stop).toHaveBeenCalledOnce();
});
