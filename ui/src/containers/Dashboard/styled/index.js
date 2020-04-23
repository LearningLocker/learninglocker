import styled from 'styled-components';

export const Editor = styled.div`
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
`;

export const EditWrapper = styled.div`
  display: flex;

  .btn {
    margin-bottom: auto;
  }

  &:global(.btn) {
    margin-bottom: auto;
  }

  div {
    padding: 0 0 0 15px;
    font-weight: 300;
    color: #929292;

    font-family: Arial, sans-serif;
  }
`;

export const EditInputWrapper = styled.div`
  flex-grow: 1;
`;
