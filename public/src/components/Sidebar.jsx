import React, { useState, useContext } from 'react';
import styled, { css, ThemeContext } from 'styled-components';
import { useHistory } from 'react-router-dom';
import { ReactComponent as Mail } from '../assets/svg/mail.svg';
import { ReactComponent as CMSIcon } from '../assets/svg/cms.svg';
import BackgroundButton from './Buttons/BackgroundButton';
import routes, { routesReverseLookup } from '../routes';

const StyledSidebar = styled.nav`
  ${({ theme }) => css`
    position: fixed;
    left: 0;
    top: 90px;
    bottom: 0;
    width: 50px;
    padding-top: ${theme.spacing.lg};
    background-color: ${theme.flavors.navbar};
    border-right: 2px solid ${theme.flavors.bgBlue};
    border-top: 2px solid ${theme.flavors.bgBlue};
    display: flex;
    flex-direction: column;
  `}
`;

const SidebarList = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  padding-left: 0;
  margin: 0;
`;

const SidebarButton = styled(BackgroundButton)`
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ theme, active }) => css`
    padding: ${theme.spacing.xs};
    ${active ? css`
      background-color: #c7f0f9;
      border-color: #c7f0f9;
      pointer-events: none;
    ` : ''}
  `}
`;

const SidebarItem = styled.li`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
  `};
`;

const CMS_KEY = 'cms';
const MAIL_KEY = 'mail';

export const Sidebar = () => {
  const history = useHistory();
  const [active, setActive] = useState(routesReverseLookup[history.location.pathname]);
  const navigate = (path, key) => {
    history.push(path);
    setActive(key);
  };
  return (
    <StyledSidebar key={history.location.pathname}>
      <SidebarList>
        <SidebarItem>
          <SidebarButton active={active === CMS_KEY} onClick={() => navigate(routes[CMS_KEY], CMS_KEY)}>
            <CMSIcon />
          </SidebarButton>
        </SidebarItem>
        <SidebarItem>
          <SidebarButton active={active === MAIL_KEY} onClick={() => navigate(routes[MAIL_KEY], MAIL_KEY)}>
            <Mail />
          </SidebarButton>
        </SidebarItem>
      </SidebarList>
    </StyledSidebar>
  );
};

export default Sidebar;
