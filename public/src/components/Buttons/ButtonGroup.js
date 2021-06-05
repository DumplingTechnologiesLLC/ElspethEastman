import styled, { css } from 'styled-components';
import SectionTitle from '@Components/Text/SectionTitle';

export const ButtonGroup = styled.div`
  ${(props) => css`
    flex-direction: ${props.vertical ? 'column' : 'row'};
    display: flex;
    width: 100%;
    ${props.separated ? css`
    button + button {
      ${
  props.vertical
    ? css`
      margin-top: ${props.theme.spacing.xs};
    `
    : css`
      margin-left: ${props.theme.spacing.xs};
    `};
      }
    ` : ''}
  `}
`;

export const TitleButtonPairing = styled.div`
  ${({ theme }) => css`
    & button {
      width: auto;
    }
    ${SectionTitle} + button {
      margin-left: ${theme.spacing.md};
    }
    button + ${SectionTitle} {
      margin-left: ${theme.spacing.md};
    }
    ${SectionTitle} + div {
      margin-left: ${theme.spacing.md};
      display: inline-flex;
      width: auto;
    }
    div + ${SectionTitle} {
      margin-left: ${theme.spacing.md};
      display: inline-flex;
      width: auto;
    }
    @media screen and (max-width: ${theme.breakpoints.latestProjects}) {
      ${SectionTitle} {
        margin-bottom: ${theme.spacing.sm};
      }
      ${SectionTitle} + div {
        margin-left: 0;
        width: 100%;
        margin-bottom: ${theme.spacing.md};
        display: inline-flex;
        width: auto;
      }
      div + ${SectionTitle} {
        margin-left: 0;
        display: inline-flex;
        width: auto;
      }
      ${SectionTitle} + button {
        margin-left: 0;
        width: 100%;
        margin-bottom: ${theme.spacing.md};
      }
      button + ${SectionTitle} {
        margin-left: 0;
      }
    }
  `}
`;
export default ButtonGroup;
