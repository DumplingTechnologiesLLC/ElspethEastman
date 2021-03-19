import styled, { css } from 'styled-components';

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
      margin-top: ${props.theme.spacing.xs}
    `
    : css`
      margin-left: ${props.theme.spacing.xs}
    `};
      }
    ` : ''}
  `}
`;
export default ButtonGroup;
