import styled from 'styled-components';

export default styled.div`
  border: 1px solid #ccc;
  border-radius: 2px;
  overflow: hidden;
  flex-wrap: wrap;
  min-height: 36px;
  display: flex;
  align-items: center;

  &:.noBorder {
    border: 1px solid transparent;
  }
  &.open {
    border-radius: 4px 4px 2px 2px;
    border-bottom: 1px solid #eee;
  }
`;
