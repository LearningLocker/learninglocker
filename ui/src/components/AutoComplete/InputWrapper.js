import styled, { css } from 'styled-components';

const openedMixin = css`
  border-radius: 4px 4px 2px 2px;
  border-bottom: 1px solid #eee;
`;

export default styled.div`
  border-radius: 2px;
  overflow: hidden;
  flex-wrap: wrap;
  min-height: 36px;
  display: flex;
  align-items: center;
  ${props => props.isBorderHidden && 'border: 1px solid transparent' || 'border: 1px solid #ccc;'}
  ${props => props.isOpen && openedMixin || ''}
`;
