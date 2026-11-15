import { expect, it } from 'vitest';
import { toContentFailure } from '../contentFailure';

it('normalizes wire field paths and copies validated error messages', () => {
  const messages = ['Required'];
  const fields = Object.fromEntries([
    ['primary_action.label', messages],
    ['metadata.0.value', ['Required']],
    ['facts.non_field_errors', ['At most two']],
    ['__proto__', ['Literal key']],
    ['bad', 42],
    ['mixed', ['Text', 42]],
  ]);
  const result = toContentFailure(400, { detail: 'Invalid fields', fields });
  messages.push('Changed later');
  expect(result).toEqual({
    status: 400,
    detail: 'Invalid fields',
    fields: {
      'primaryAction.label': ['Required'],
      'metadata.0.value': ['Required'],
      'facts.form': ['At most two'],
      ...Object.fromEntries([['__proto__', ['Literal key']]]),
    },
  });
  expect(Object.getPrototypeOf(result.fields)).toBe(Object.prototype);
});

it.each([
  null,
  'upstream HTML',
  [],
  42,
  {},
  { detail: 42, fields: [] },
  { fields: null },
])('supplies a safe message for malformed upstream body %j', (body) => {
  expect(toContentFailure(502, body)).toEqual({
    status: 502,
    detail: 'The request failed. Please try again.',
    fields: {},
  });
});

it('distinguishes a network failure from an HTTP response and accepts empty field collections', () => {
  expect(toContentFailure(null, null)).toEqual({
    status: null,
    detail: 'Could not connect. Please try again.',
    fields: {},
  });
  expect(toContentFailure(400, { fields: { title: [] } }).fields).toEqual({
    title: [],
  });
});
