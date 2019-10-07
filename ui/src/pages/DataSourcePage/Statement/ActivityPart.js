import React from 'react';
import styled from 'styled-components';
import { displayActivity } from '../../../utils/xapi';
import { Part } from './Part';

const Activity = styled.a`
  font-weight: normal;
`;

/**
 * @param {{
 *  onSetFilter: () => void;
 *  value: any;
 * }} props
 */
export function ActivityPart(props) {
  return (
    <Activity>
      <Part value={props.value} onSetFilter={props.onSetFilter}>
        {displayActivity(props.value)}
      </Part>
    </Activity>
  );
}
