import styled, { css } from 'styled-components';

const baseInputStyles = css`
  display: block;
  text-align: center;
  width: 100%;
  color: #333;
  background: #f5aa34 !important;
  margin-left: 12px;
  &:hover, &:focus {
    color: #333 !important;
  }
  margin-top: 20px;
`;

export const RegistrationLink = styled.a`
  ${baseInputStyles}
`;

export const RegistrationLinkAccented = styled.a`
  ${baseInputStyles}
  font-weight: 700;
`;
