import styled from 'styled-components';
import Sections from 'ui/containers/BasicQueryBuilder/Sections';

export const ExpandedTitle = styled.span`
  font-weight: bold;
  cursor: pointer;
`;

export const ExpandedSectionWrapper = styled.div`
  padding-bottom: 20px;

  > ${ExpandedTitle} {
    font-size: 16px;
  }
`;

export const CollapsedSectionWrapper = styled.a`
  margin-right: 10px;
  cursor: pointer;
  align-self: flex-start;
  white-space: normal;
  word-break: break-all;
  ${props => props.isUsed && 'color: #F5AB35;' || 'color: #687B88;'}
`;

export const TopLevelSectionsContainer = styled(Sections)`
  display: flex;
  flex-direction: column;

  > ${CollapsedSectionWrapper} {
    font-size: 16px;
  }
`;

export const ExpandedSectionsContainer = styled(Sections)`
  padding-top: 10px;
  padding-left: 10px;
  border-left: 1px dotted #ccc;
  display: flex;
  flex-direction: column;
`;

export const CriterionValue = styled.div`
  min-height: 30px;
  ${props => props.isFullWidth && 'width: 100%;' || 'width: 71%;'}
`;

export const CriterionButton = styled.button`
  width: 10%;
  justify-content: flex-end;
  height: 30px;
  line-height: 28px;
  margin-left: auto;
`;

export const CriterionWrapper = styled.div`
  margin-bottom: 4px;
  display: flex;
  flex-direction: row;
`;

export const RadioLabel = styled.label`
  width: 20%;
  min-width: 50px;
`;

export const CriterionOperator = styled.div`
  padding-top: 2px;
  width: 15%;
  margin-right: 2%;
  justify-content: flex-start;
  min-height: 30px;
`;
