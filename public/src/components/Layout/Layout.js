import styled, { css } from 'styled-components';

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const Column = styled.div`
  ${(props) => css`
    flex: 1;
    max-width: ${100 / props.columnCount}%;
  `}
`;

export default Column;
