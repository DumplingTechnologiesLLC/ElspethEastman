import { expect, it } from 'vitest';
import { cmsReturnTo, loginReturnTo } from '../cmsReturnTo';

it.each([
  [null, '/cms'],
  ['/cms', '/cms'],
  ['/cms/voiceover?role=4#roles', '/cms/voiceover?role=4#roles'],
  ['https://evil.invalid/cms', '/cms'],
  ['//evil.invalid/cms', '/cms'],
  ['/cms-evil', '/cms'],
  ['/api', '/cms'],
  ['/cms/../api', '/cms'],
  ['http://[', '/cms'],
])('restricts the login return location %s to the CMS', (input, expected) => {
  expect(cmsReturnTo(input)).toBe(expected);
});

it('resolves encoded return locations without losing the selected item or anchor', () => {
  expect(
    loginReturnTo('/login?returnTo=%2Fcms%2Fpress%3Fentry%3D12%23coverage'),
  ).toBe('/cms/press?entry=12#coverage');
  expect(loginReturnTo('/login')).toBe('/cms');
});
