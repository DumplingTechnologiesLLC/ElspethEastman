import * as stylex from '@stylexjs/stylex';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { PageKind } from '../../domain/models/Page';
import { Button } from '../../ui/Controls/Controls.presentational';
import { tokens } from '../../ui/tokens.stylex';
import type { usePortfolioState } from './usePortfolioState';

const css = stylex.create({
  root: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.canvas,
    color: tokens.foreground,
    fontFamily: tokens.sans,
    colorScheme: 'dark',
  },
  header: {
    height: { default: 70, '@media (max-width: 760px)': 64 },
    boxSizing: 'border-box',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: { default: 32.096, '@media (max-width: 760px)': 18 },
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line,
    position: 'relative',
    zIndex: 5,
  },
  brand: {
    fontFamily: tokens.sans,
    fontSize: 12.16,
    fontWeight: 700,
    letterSpacing: '2.6752px',
    textTransform: 'uppercase',
    color: tokens.foreground,
    textDecoration: 'none',
  },
  desktop: {
    display: { default: 'flex', '@media (max-width: 760px)': 'none' },
    gap: 20.06,
    alignItems: 'center',
  },
  link: {
    color: {
      default: tokens.secondary,
      ':hover': tokens.foreground,
      ':focus-visible': tokens.accent,
    },
    textDecoration: 'none',
    fontSize: 10.24,
    letterSpacing: '1.2288px',
    textTransform: 'uppercase',
    paddingBlock: 8,
  },
  active: { color: tokens.foreground },
  toggle: {
    display: { default: 'none', '@media (max-width: 760px)': 'flex' },
    width: 36,
    height: 36,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: tokens.foreground,
    cursor: 'pointer',
  },
  bar: { width: 24, height: 1, backgroundColor: tokens.foreground },
  menu: {
    display: 'none',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: tokens.canvas,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.line,
    paddingBlock: 16,
    paddingInline: 20,
    flexDirection: 'column',
    gap: 12,
  },
  menuOpen: {
    display: { default: 'none', '@media (max-width: 760px)': 'flex' },
  },
  main: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    outline: 'none',
  },
  footer: {
    display: 'flex',
    flexDirection: { default: 'row', '@media (max-width: 760px)': 'column' },
    justifyContent: 'space-between',
    gap: { default: 0, '@media (max-width: 760px)': 18 },
    flexShrink: 0,
    paddingBlock: 16,
    paddingInline: 22,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    color: tokens.muted,
    fontSize: 8.64,
    letterSpacing: '.6912px',
    textTransform: 'uppercase',
  },
  status: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 20,
    padding: 40,
  },
  heading: {
    fontFamily: tokens.serif,
    fontSize: 40,
    fontWeight: 400,
    margin: 0,
  },
  cms: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    paddingBlock: 8,
    paddingInline: 20,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.accentBorder,
    color: tokens.accent,
    fontSize: 11,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
  },
  skip: {
    position: 'absolute',
    top: { default: -100, ':focus': 8 },
    left: 20,
    zIndex: 20,
    color: tokens.foreground,
    backgroundColor: tokens.canvas,
    padding: 12,
  },
});
export interface PortfolioSlots {
  readonly pages: Readonly<Record<PageKind, ReactNode>>;
  readonly login: ReactNode;
  readonly editorDialog: ReactNode;
  readonly notifications: ReactNode;
}
function intercepted(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
export function Portfolio({
  screen,
  editor,
  authenticated,
  pageKind,
  title,
  homeHref,
  links,
  year,
  toggleHref,
  error,
  navigate,
  retry,
  logout,
  pages,
  login,
  editorDialog,
  notifications,
}: ReturnType<typeof usePortfolioState> & PortfolioSlots) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();
  const dismiss = () => {
    setMenuOpen(false);
    toggle.current!.focus();
  };
  useEffect(() => {
    document.title = title;
  }, [title]);
  const visit = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (intercepted(event)) {
      event.preventDefault();
      setMenuOpen(false);
      navigate(href);
    }
  };
  const navLinks = links.map((item) => (
    <a
      key={item.id}
      href={item.href}
      {...stylex.props(css.link, item.active && css.active)}
      aria-current={item.active ? 'page' : undefined}
      onClick={(event) => visit(event, item.href)}
    >
      {item.label}
    </a>
  ));
  return (
    <div {...stylex.props(css.root)}>
      <a href="#content" {...stylex.props(css.skip)}>
        Skip to content
      </a>
      <header {...stylex.props(css.header)}>
        <a
          {...stylex.props(css.brand)}
          href={homeHref}
          onClick={(event) => visit(event, homeHref)}
        >
          Elspeth Eastman
        </a>
        <nav aria-label="Main navigation" {...stylex.props(css.desktop)}>
          {navLinks}
        </nav>
        <button
          ref={toggle}
          {...stylex.props(css.toggle)}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls={id}
          onClick={() => setMenuOpen(!menuOpen)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') dismiss();
          }}
        >
          <span {...stylex.props(css.bar)} />
          <span {...stylex.props(css.bar)} />
        </button>
        <nav
          id={id}
          aria-label="Mobile navigation"
          {...stylex.props(css.menu, menuOpen && css.menuOpen)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') dismiss();
          }}
        >
          {menuOpen && navLinks}
        </nav>
      </header>
      {authenticated && (
        <div {...stylex.props(css.cms)}>
          <span>{editor ? 'Content editor' : 'Editor signed in'}</span>
          <a
            href={toggleHref}
            {...stylex.props(css.link)}
            onClick={(event) => visit(event, toggleHref)}
          >
            {editor ? 'View public page' : 'Edit page'}
          </a>
          <Button variant="secondary" onClick={() => void logout()}>
            Log out
          </Button>
        </div>
      )}
      <main id="content" tabIndex={-1} {...stylex.props(css.main)}>
        {screen === 'page' && pageKind !== null ? (
          pages[pageKind]
        ) : screen === 'login' ? (
          login
        ) : (
          <section {...stylex.props(css.status)}>
            <h1 {...stylex.props(css.heading)}>
              {screen === 'error'
                ? 'Unable to load the site'
                : screen === 'missing'
                  ? 'Page not found'
                  : screen === 'authenticating'
                    ? 'Checking your session…'
                    : 'Loading…'}
            </h1>
            {screen === 'error' && (
              <>
                <p role="alert">{error}</p>
                <Button onClick={() => void retry()}>Try again</Button>
              </>
            )}
            {screen === 'missing' && (
              <a
                href={homeHref}
                {...stylex.props(css.link)}
                onClick={(event) => visit(event, homeHref)}
              >
                Return home
              </a>
            )}
          </section>
        )}
      </main>
      <footer {...stylex.props(css.footer)}>
        <span>© {year} Elspeth Eastman</span>
        <span>Designed by Dumpling Technologies LLC</span>
      </footer>
      {editor && editorDialog}
      {notifications}
    </div>
  );
}
