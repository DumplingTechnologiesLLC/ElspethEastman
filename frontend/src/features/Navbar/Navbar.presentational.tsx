import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { faSignOutAlt, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { Button, Icon } from '../../ui/Primitives.presentational';
import { styles } from '../../ui/styles';
import Brand from '../../assets/NavbarBrand.webp';
import Hamburger from '../../assets/svg/HamburgerMenu.svg?react';
import type { useNavbarState } from './useNavbarState';
const css = stylex.create({
  nav: {
    zIndex: 100,
    backgroundColor: 'white',
    padding: '.5em 1em',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'rgba(1,208,254,.3)',
    alignItems: 'center',
    position: { default: 'sticky', '@media (max-width: 760px)': 'fixed' },
    top: 0,
    flexWrap: { default: 'nowrap', '@media (max-width: 760px)': 'wrap' },
    width: { default: 'auto', '@media (max-width: 760px)': '100%' },
  },
  items: {
    listStyle: 'none',
    display: 'flex',
    margin: 0,
    padding: 0,
    transition: 'height .3s ease-out',
    overflow: { default: 'visible', '@media (max-width: 760px)': 'hidden' },
    transformOrigin: 'top center',
    minWidth: { default: 0, '@media (max-width: 760px)': '100%' },
    flexDirection: { default: 'row', '@media (max-width: 760px)': 'column' },
  },
  item: {
    cursor: 'pointer',
    padding: { default: '0 .5em', '@media (max-width: 760px)': '.5em' },
  },
  link: {
    fontFamily: 'Montserrat, sans-serif',
    color: '#292929',
    textDecoration: 'none',
    position: 'relative',
    ':visited': { color: '#292929' },
    '::after': {
      position: 'absolute',
      content: '" "',
      left: 0,
      right: 0,
      transition: 'transform .2s ease-out',
      bottom: -2,
      height: 2,
      backgroundColor: '#01d1fe',
      transform: { default: 'scaleX(0)', ':hover': 'scaleX(1)' },
      transformOrigin: 'center center',
    },
  },
  brand: { height: 80 },
  toggle: {
    maxWidth: 40,
    display: { default: 'none', '@media (max-width: 760px)': 'flex' },
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburger: { minHeight: 30, maxHeight: 30, minWidth: 30 },
  heading: {
    fontFamily: 'Dolcissimo, sans-serif',
    fontWeight: 'bold',
    color: '#292929',
    display: 'inline-block',
    fontSize: { default: '2em', '@media (max-width: 579px)': 16 },
    marginLeft: '.5em',
  },
  cmsBrand: { display: 'flex', alignItems: 'center', textDecoration: 'none' },
});
const links = [
  ['About Me', '/#PageStart'],
  ['Latest Projects', '/#latestProjects'],
  ['Reels & Music', '/#Music'],
  ['Experience', '/#Experience'],
] as const;
export function Navbar({
  cms,
  authenticated,
  navigate,
  logout,
  onContact,
}: ReturnType<typeof useNavbarState>) {
  const items = useRef<HTMLUListElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    let transitioned = false;
    const resize = () => {
      if (window.innerWidth > 760) {
        items.current!.style.height = '';
        setCollapsed(false);
        transitioned = false;
      } else if (!transitioned && window.innerWidth < 760) {
        transitioned = true;
        setCollapsed(true);
        items.current!.style.height = '0px';
      }
    };
    window.addEventListener('resize', resize);
    if (!cms) resize();
    return () => window.removeEventListener('resize', resize);
  }, [cms]);
  const toggle = () => {
    const list = items.current!;
    if (collapsed) {
      list.style.height = `${list.scrollHeight}px`;
      setCollapsed(false);
    } else {
      list.style.height = `${list.scrollHeight}px`;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          list.style.height = '0px';
        }),
      );
      setCollapsed(true);
    }
  };
  const anchor = (event: MouseEvent, path: string) => {
    event.preventDefault();
    const hash = path.split('#')[1];
    const target = hash ? document.getElementById(hash) : null;
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    else navigate(path);
  };
  return (
    <nav {...stylex.props(css.nav)}>
      {cms ? (
        <a {...stylex.props(css.cmsBrand)} href="/cms">
          <img {...stylex.props(css.brand)} src={Brand} alt="Brand image" />
          <h1 {...stylex.props(css.heading)}>Content Management System</h1>
        </a>
      ) : (
        <a onClick={(event) => anchor(event, '/#PageStart')} href="#PageStart">
          <img {...stylex.props(css.brand)} src={Brand} alt="Brand image" />
        </a>
      )}
      <Button
        variant="background"
        {...stylex.props(styles.button, styles.background, css.toggle)}
        onClick={toggle}
        onKeyUp={(event) => {
          if (event.key === 'Enter') toggle();
        }}
      >
        <Hamburger {...stylex.props(css.hamburger)} />
      </Button>
      <ul {...stylex.props(css.items)} ref={items}>
        {cms ? (
          <>
            <li {...stylex.props(css.item)}>
              <a
                {...stylex.props(css.link)}
                href="/"
                onClick={(event) => anchor(event, '/')}
              >
                View Public Site
              </a>
            </li>
            <li {...stylex.props(css.item)}>
              <a
                {...stylex.props(css.link)}
                href="#"
                onClick={() => {
                  if (authenticated) void logout();
                  else navigate('/login');
                }}
              >
                {authenticated ? 'Logout' : 'Login'}{' '}
                <Icon definition={authenticated ? faSignOutAlt : faSignInAlt} />
              </a>
            </li>
          </>
        ) : (
          <>
            {links.map(([title, path]) => (
              <li {...stylex.props(css.item)} key={path}>
                <a
                  {...stylex.props(css.link)}
                  href={path}
                  onClick={(event) => anchor(event, path)}
                >
                  {title}
                </a>
              </li>
            ))}
            <li {...stylex.props(css.item)}>
              <a
                {...stylex.props(css.link)}
                tabIndex={0}
                onClick={(event) => {
                  event.preventDefault();
                  onContact();
                }}
              >
                Contact Me
              </a>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
