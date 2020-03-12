import styled, { css } from 'styled-components';

export const InputWrapper = styled.div`
  border-radius: 2px;
  border: 1px solid #ccc;
  overflow: hidden;
  flex-wrap: wrap;
  min-height: 36px;
  display: flex;
  align-items: center;
  ${
    props => props.isFocused
      && css`
        border-radius: 2px 2px 0 0;
        border-bottom: 1px solid #eee;
      `
  }

  input {
    border: none;
    box-shadow: none;
    flex-grow: 1;
    height: 36px;
    padding: 0 8px;
    outline-color: #F5AB35;
    text-overflow: ellipsis;
  }
`;
