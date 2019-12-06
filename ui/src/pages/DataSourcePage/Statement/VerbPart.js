import React from 'react';
import styled from 'styled-components';
import { displayVerb } from '../../../utils/xapi';
import { Part } from './Part';

const Verb = styled.a`
  font-weight: 600;
  color: #555459;
`;

/**
 * @param {{
 *  onSetFilter: () => void;
 *  value: any;
 * }} props
 */
export function VerbPart(props) {
  return (
    <Verb>
      <Part value={props.value} onSetFilter={props.onSetFilter}>
        {displayVerb(props.value)}
      </Part>
    </Verb>
  );
}
