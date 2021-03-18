import React, {
  useEffect, useState, useContext, useRef,
} from 'react';
import PropTypes from 'prop-types';
import styled, { css, ThemeContext } from 'styled-components';
import NavbarBrandImage from '../assets/NavbarBrand.png';
import BackgroundButton from './Buttons/BackgroundButton';
import { ReactComponent as HamburgerMenu } from '../assets/svg/HamburgerMenu.svg';

const StyledNav = styled.nav`
  ${(props) => css`
    z-index: 99999;
    background-color: ${props.theme.flavors.navbar};
    padding: .5em 1em;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    border-bottom: 2px solid ${props.theme.flavors.bgBlue};
    align-items: center;
    position: sticky;
    top: 0;
    ${props.theme.mixins.navbarBreakpoint(css`
      flex-wrap: wrap;
      position: fixed;
      width: 100%;
    `)}
  `}
`;

const StyledNavItems = styled.ul`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  ${(props) => css`
  ${props.theme.mixins.transition(['height', '.3s', 'ease-out'])};
  overflow: hidden;
  ${props.theme.mixins.navbarBreakpoint(css`
    transform-origin: top center;
    min-width: 100%;
    flex-direction: column;
    `)}
  `}
`;

const StyledNavItem = styled.li`
  padding: 0 .5em;
  cursor: pointer;
  ${(props) => css`
    ${props.theme.mixins.navbarBreakpoint(css`
      padding: .5em;
    `)}
  `}
`;

const StyledNavLink = styled.a`
  ${(props) => css`
    ${props.theme.text.baseContentTextStyling}
    text-decoration: none;
    position: relative;
    &:visited {
      color: ${props.theme.flavors.baseTextColor};
    }
    &::after {
      position: absolute;
      content: ' ';
      left: 0;
      right: 0;
      ${props.theme.mixins.transition(['transform', '.2s', 'ease-out'])};
      bottom: -2px;
      height: 2px;
      background-color: ${props.theme.flavors.blue};
      transform: scaleX(0);
      transform-origin: center center;
    }
    &:hover {
      text-decoration: none;
      &::after {
        transform: scaleX(1);
      }
    }
  `}
`;

const StyledNavbarButton = styled(BackgroundButton)`
  max-width: 40px;
  display: none;
  ${(props) => css`
    svg {
      min-height: 30px;
      max-height:30px;
      min-width: 30px;
    }
    fill: ${props.theme.mixins.baseTextColor};
    ${props.theme.mixins.navbarBreakpoint(css`
      display: flex;
      justify-content: center;
      align-items: center;
    `)}
  `}
`;

const StyledNavBrand = styled.img`
  height: 80px;
`;

export const Navbar = ({ handleContactMe }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [transitioned, setTransitioned] = useState(false);
  const navbarItems = useRef(null);
  const themeContext = useContext(ThemeContext);
  const handleAnchor = (event, link) => {
    event.preventDefault();
    const el = document.querySelector(link.substring(1, link.length));
    el ? el.scrollIntoView({
      behavior: 'smooth',
    }) : window.location = link;
  };

  const collapseSection = () => {
    const sectionHeight = navbarItems.current.scrollHeight;
    const elementTransition = navbarItems.current.style.transition;
    navbarItems.current.style.transition = '';
    navbarItems.current.style.height = `${sectionHeight}px !important`;
    requestAnimationFrame(() => {
      navbarItems.current.style.height = `${sectionHeight}px`;
      navbarItems.current.style.transition = elementTransition;
      // on the next frame (as soon as the previous style change has taken effect),
      // have the element transition to height: 0
      requestAnimationFrame(() => {
        navbarItems.current.style.height = '0px';
      });
    });

    setCollapsed(true);
  };
  const postTransition = () => {
    navbarItems.current.removeEventListener('transitionend', postTransition);
    if (collapsed) {
      navbarItems.current.style.height = 'auto';
    }
  };
  const expandSection = () => {
    if (!collapsed) return;
    const sectionHeight = navbarItems.current.scrollHeight;
    navbarItems.current.style.height = `${sectionHeight}px`;

    navbarItems.current.addEventListener('transitionend', postTransition);

    setCollapsed(false);
  };
  const expandOrCollapse = () => {
    collapsed ? expandSection() : collapseSection();
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > themeContext.breakpoints.navbarBreakpoint) {
        navbarItems.current.style = '';
        setCollapsed(false);
        setTransitioned(false);
      } else if (!transitioned && window.innerWidth < themeContext.breakpoints.navbarBreakpoint) {
        setTransitioned(true);
        setCollapsed(true);
        navbarItems.current.style.height = '0px';
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <StyledNav>
      <a onClick={(e) => handleAnchor(e, '#PageStart')} href="#PageStart">
        <StyledNavBrand src={NavbarBrandImage} alt="Brand image" />
      </a>
      <StyledNavbarButton onClick={expandOrCollapse}>
        <HamburgerMenu />
      </StyledNavbarButton>
      <StyledNavItems collapsed={collapsed} ref={navbarItems}>
        <StyledNavItem>
          <StyledNavLink onClick={(e) => handleAnchor(e, '/#PageStart')} href="/#PageStart">
            About Me
          </StyledNavLink>
        </StyledNavItem>
        <StyledNavItem>
          <StyledNavLink onClick={(e) => handleAnchor(e, '/#latestProjects')} href="/#latestProjects">
            Latest Projects
          </StyledNavLink>
        </StyledNavItem>
        <StyledNavItem>
          <StyledNavLink onClick={(e) => handleAnchor(e, '/#Music')} href="/#Music">
            Reels &amp; Music
          </StyledNavLink>
        </StyledNavItem>
        <StyledNavItem>
          <StyledNavLink onClick={(e) => handleAnchor(e, '/#Experience')} href="/#Experience">
            Experience
          </StyledNavLink>
        </StyledNavItem>
        <StyledNavItem>
          <StyledNavLink tabIndex={0} onClick={(e) => { e.preventDefault(); handleContactMe(true); }}>
            Contact Me
          </StyledNavLink>
        </StyledNavItem>
      </StyledNavItems>
    </StyledNav>
  );
};

Navbar.propTypes = {
  handleContactMe: PropTypes.func.isRequired,
};

export default Navbar;
