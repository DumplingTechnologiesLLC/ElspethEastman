import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import NavbarBrandImage from '../assets/NavbarBrand.png';

const StyledNav = styled.nav`
  ${(props) => css`
    z-index: 999;
    background-color: ${props.theme.flavors.navbar};
    padding: .5em 1em;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
  `}
`;

const StyledNavItems = styled.ul`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
`;

const StyledNavItem = styled.li`
  padding: 0 .5em;
  cursor: pointer;
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

const StyledNavBrand = styled.img`
  height: 80px;
`;

export const Navbar = ({ handleContactMe }) => {
  const handleAnchor = (event, link) => {
    event.preventDefault();
    const el = document.querySelector(link.substring(1, link.length));
    el ? el.scrollIntoView({
      behavior: 'smooth',
    }) : window.location = link;
  };
  return (
    <StyledNav>
      <a onClick={(e) => handleAnchor(e, '#PageStart')} href="#PageStart">
        <StyledNavBrand src={NavbarBrandImage} alt="Brand image" />
      </a>
      <StyledNavItems>
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
          <StyledNavLink onClick={(e) => { e.preventDefault(); handleContactMe(true); }}>
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
