import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ApplicationWired } from '../frontend/src/features/Application/Application.wired';
import { fixturePorts } from './fakes';
// @vitest-environment node

it('renders separate request-scoped service containers without DOM globals or provider state', () => {
  const anonymous = fixturePorts();
  const editor = fixturePorts();
  editor.tokens.write('request-token');
  editor.navigation.go('/cms');
  const first = renderToString(
    <ApplicationWired services={anonymous.services()} />,
  );
  const second = renderToString(
    <ApplicationWired services={editor.services()} />,
  );
  expect(first).toContain('HI, I');
  expect(first).not.toContain('Content Management System');
  expect(second).toContain('Content Management System');
  expect(second).toContain('Save All Changes');
  expect(anonymous.tokens.read()).toBeNull();
  expect(editor.tokens.read()).toBe('request-token');
  expect(anonymous.http.request).not.toHaveBeenCalled();
  expect(editor.http.request).not.toHaveBeenCalled();
});
