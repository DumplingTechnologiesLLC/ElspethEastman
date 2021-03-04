import styled, { css } from 'styled-components';

export const ButtonGroup = styled.div`
  ${(props) => css`
    flex-direction: ${props.vertical ? 'column' : 'row'};
    display: flex;
    width: 100%;
    ${props.separated ? css`
    button + button {
      ${props.vertical ? 'margin-top: .25em' : 'margin-left: .25em'};
    }
    ` : ''}
  `}
`;
export default ButtonGroup;
