import styled from 'styled-components';

export default styled.div`
  border: 1px solid #ccc;
  border-radius: 2px;
  overflow: hidden;
  flex-wrap: wrap;
  min-height: 36px;
  display: flex;
  align-items: center;

  & input {
    border: none;
    box-shadow: none;
    flex-grow: 1;
    height: 36px;
    padding: 0px 8px;
    outline-color: #F5AB35;
    text-overflow: ellipsis;
  }
  &.noBorder {
    border: 1px solid transparent;
  }
  &.open {
    border-radius: 2px 2px 0px 0px;
    border-bottom: 1px solid #eee;
  }
`;
