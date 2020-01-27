import styled from 'styled-components';

export const QueryForm = styled.div`
  border: 1px solid #f1f1f1;
  padding: 10px;

  span {
    white-space: normal;
    word-break: break-all;
  }

  > span {
    > .childContainer {
      margin-left: 0;

      > .expandedChildren > span > .formGroup > label {
        font-size: 1.2em;
      }
    }
  }

  label {
    cursor: pointer;
    font-weight: normal;
    word-wrap: break-word;
  }

  textarea {
    margin-top: 8px;
    width: 100%;
  }
`;

export const ButtonBox = styled.div`
  flex-wrap: nowrap;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;

  button {
    margin-left: 4px;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;

  button {
    margin-left: 8px;
    margin-bottom: auto;
    margin-top: auto;
  }
`;
