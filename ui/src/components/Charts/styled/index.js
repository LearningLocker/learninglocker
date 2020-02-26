import styled from 'styled-components';

export const Chart = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;

  svg g text {
    font-size: 12px;
  }
`;

export const ChartWrapper = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
`;

export const BarContainer = styled.div`
  display: flex;
  flex-grow: 1;
`;

export const CustomTooltip = styled.div`
  width: auto;
  margin: 0;
  padding-top: 5px;
  padding-left: 5px;
  padding-right: 5px;
  line-height: 8px;
  border: 2px solid #f5f5f5;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  font-size: 12px;
`;

export const Label = styled.p`
  color: #ED7030;
  font-weight: 700;
  word-break: break-all;
`;

export const Value = styled.div`
  color: #000;
  font-weight: 300;
`;

export const Desc = styled.div`
  margin: 0;
  color: #999;
`;

export const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  margin-top: -4px;
`;

export const XAxis = styled.span`
  display: inline-block;
  white-space: nowrap;
`;

export const XAxisLabel = styled.div`
  text-align: right;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  position: static;
  margin-right: 15px;
  margin-bottom: 10px;
`;

export const YAxis = styled.div`
  display: inline-block;
  writing-mode: vertical-rl;
  transform: rotate(-180deg);
  margin: auto 0;
  white-space: pre-wrap;
`;
