import styled, { css } from 'styled-components';

const wrapperCollapsedMixin = css`
  margin-top: 0;
  margin-bottom: 0;

  p {
    padding: 8px;
  }
`;
const wrapperExpandedMixin = css`
  margin-top: 11px;
  margin-bottom: 11px;
`;

export const Wrapper = styled.div`
  ${props => props.isExpanded && wrapperExpandedMixin || wrapperCollapsedMixin}
`;

export const BuilderDescription = styled.span`
  margin-left: 10px;
  font-weight: 500;
`;

export const Creator = styled.span`
  margin-top: -4px;
  text-align: right;
  font-size: 11px;
  margin-left: 30px;
`;
