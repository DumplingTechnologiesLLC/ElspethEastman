import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { Button } from '../Controls/Controls.presentational';
import { tokens } from '../tokens.stylex';
const css = stylex.create({
  body: {
    padding: 32,
    color: tokens.foreground,
    backgroundColor: tokens.canvas,
    fontFamily: tokens.sans,
  },
  title: { fontFamily: tokens.serif, fontSize: 32, fontWeight: 400 },
});
export function PageBoundary({
  ready,
  error,
  retry,
  children,
}: {
  ready: boolean;
  error: string | null;
  retry: () => Promise<void>;
  children: ReactNode;
}) {
  return ready ? (
    children
  ) : (
    <section {...stylex.props(css.body)}>
      <h1 {...stylex.props(css.title)}>
        {error === null ? 'Loading page…' : 'Unable to load this page'}
      </h1>
      {error !== null && (
        <>
          <p role="alert">{error}</p>
          <Button onClick={() => void retry()}>Try again</Button>
        </>
      )}
    </section>
  );
}
