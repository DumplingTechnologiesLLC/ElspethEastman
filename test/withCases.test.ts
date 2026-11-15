import { it, expect, vi } from 'vitest';
import { withCases } from '../tooling/withCases';
it('registers independently named rows and passes native fixture callbacks through unchanged', () => {
  const register = vi.fn();
  const base = register;
  const each = withCases(base);
  const first = vi.fn();
  const second = vi.fn();
  each.each([
    { name: 'first', body: first },
    { name: 'second', body: second },
  ])((row) => each(`runs ${row.name}`, row.body));
  expect(each).toBe(base);
  expect(register.mock.calls).toEqual([
    ['runs first', first],
    ['runs second', second],
  ]);
  expect(first).not.toHaveBeenCalled();
  expect(second).not.toHaveBeenCalled();
});
