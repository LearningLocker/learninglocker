import styled from 'styled-components';
import { rotation } from 'ui/utils/styled/animations';

export default styled.div`
  width: 18px;
  height: 18px;
  margin: 3px;
  animation: ${rotation} .75s infinite linear;
  border-right: 2px solid #ddd;
  border-left: 2px solid #ddd;
  border-bottom: 2px solid #ddd;
  border-top: 2px solid #888;
  border-radius: 100%;
  margin-left: auto;
`;
