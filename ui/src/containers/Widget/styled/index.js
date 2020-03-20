import styled from 'styled-components';

export const WidgetDropdownIcon = styled.i`
  margin-right: 8px;
`;

export const WidgetTitle = styled.div`
  cursor: move;
  padding: 10px;
`;

export const Widget = styled.div`
  height: 100%;
  padding: 0 0 0 0;
  border-top: 4px solid #ccc;
`;

export const WidgetContent = styled.div`
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const WidgetHeading = styled.div`
  padding: 0;
  /* height: 43px;  */
`;

export const WidgetBody = styled.div`
  padding: 0 10px 10px 10px;
  /*h eight: calc( 100% - 43px ); */
  height: 0;
  flex-grow: 1;
`;

export const MenuButton = styled.a`
  padding: 8px;
`;

export const CloseButton = styled.a`
  float: left;
  padding-left: 20px !important;
  margin-right: 10px !important;
`;
