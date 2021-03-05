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
      margin-top: ${props.theme.buttonGroup.spacing}
    `
    : css`
      margin-left: ${props.theme.buttonGroup.spacing}
    `};
      }
    ` : ''}
  `}
`;
export default ButtonGroup;
