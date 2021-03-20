import styled, { css } from 'styled-components';
import SectionTitle from '../Text/SectionTitle';

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
    @media screen and (max-width: ${theme.breakpoints.latestProjects}) {
      ${SectionTitle} {
        margin-bottom: ${theme.spacing.sm};
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
