import React, {
  useEffect, useState, useContext, useRef,
} from 'react';
import styled, { css, ThemeContext } from 'styled-components';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import NavbarBrandImage from '@Assets/NavbarBrand.webp';
import { ReactComponent as HamburgerMenu } from '@Assets/svg/HamburgerMenu.svg';
import routes from '@App/routes';
import {
  StyledNav,
  StyledNavItems,
  StyledNavItem,
  StyledNavLink,
  StyledNavbarButton,
  StyledNavBrand,
} from '@Components/Navbar';

const NavbarTitle = styled.h1`
  ${({ theme }) => css`
    ${theme.text.baseTitleStyling};
    color: #292929;
    display:inline-block;
    @media screen and (max-width: 579px) {
      font-size: 16px;
    }
  `}
`;

const ContentManagementNavHeader = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none;
  img + h1 {
    margin-left: ${({ theme }) => theme.spacing.sm};
  }
`;

export const CMSNavbar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [transitioned, setTransitioned] = useState(false);

  const navbarItems = useRef(null);
  const themeContext = useContext(ThemeContext);

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
    /**
     * We don't care about the values used above firing another version of the hook since the window
     * resize handles that
     */
    /* eslint-disable react-hooks/exhaustive-deps */
  }, []);
  return (
    <StyledNav>
      <ContentManagementNavHeader
        href={routes.cms}
      >
        <StyledNavBrand src={NavbarBrandImage} alt="Brand image" />
        <NavbarTitle>Content Management System</NavbarTitle>
      </ContentManagementNavHeader>
      <StyledNavbarButton
        onClick={expandOrCollapse}
        onKeyUp={(e) => (e.key === 'Enter' ? expandOrCollapse() : null)}
      >
        <HamburgerMenu />
      </StyledNavbarButton>
      <StyledNavItems collapsed={collapsed} ref={navbarItems}>
        <StyledNavItem>
          <StyledNavLink
            as={Link}
            to={routes.home}
          >
            View Public Site
          </StyledNavLink>
        </StyledNavItem>
        <StyledNavItem>
          <StyledNavLink
            href={routes.logout}
          >
            Logout
            {' '}
            <FontAwesomeIcon icon={faSignOutAlt} />
          </StyledNavLink>
        </StyledNavItem>
      </StyledNavItems>
    </StyledNav>
  );
};

CMSNavbar.propTypes = {
};

export default CMSNavbar;
