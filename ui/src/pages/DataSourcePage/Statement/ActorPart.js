import React from 'react';
import styled from 'styled-components';
import { displayActor } from '../../../utils/xapi';
import { Part } from './Part';

const Actor = styled.a`
  font-weight: normal;
  color: #555459;
`;

/**
 * @param {{
 *  onSetFilter: () => void;
 *  value: any;
 * }} props
 */
export function ActorPart(props) {
  return (
    <Actor>
      <Part value={props.value} onSetFilter={props.onSetFilter}>
        {displayActor(props.value)}
      </Part>
    </Actor>
  );
}
