import React from 'react';
import { compose, withState } from 'recompose';
import styled from 'styled-components';
import FocusGroup from 'ui/components/FocusGroup/FocusGroup';
import TextInputGroup from 'ui/components/TextInputGroup';
import Token from 'ui/components/Token';

const InputWrapper = styled.div`
  border: 1px solid #ccc;
  border-radius: 2px;
  overflow: hidden;
  flex-wrap: wrap;
  min-height: 36px;
  display: flex;
  align-items: center;
`;

/**
 * Multi Input for query builder without search
 */
const MultiInput = ({
  // props
  options,        // List<string>
  onAddOption,    // (value: string) => void
  onRemoveOption, // (value: string) => void

  // event handlers
  onKeyPress,

  // local states
  hasFocus,
  setFocus
}) => (
  <div onKeyPress={onKeyPress}>
    <FocusGroup
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      hasFocus={hasFocus} >
      <InputWrapper>
        {
          options.map((option, i) => (
            <Token
              key={i}
              handleRemove={onRemoveOption}
              index={option}
              parse={x => x}
              parseTooltip={x => x}
              value={option} />
          ))
        }

        {
          hasFocus &&
          <div
            style={{ width: '100%' }} >
            <TextInputGroup
              onSubmit={x => onAddOption(x.value)}
              fields={['value']}
              defaultValues={['']}
              submitIcon="ion-plus-circled"
              cancelIcon={null} />
          </div>
        }
      </InputWrapper>
    </FocusGroup>
  </div>
);

/**
 * MultiInput
 *
 * onAddValue {}
 */
export default compose(
  withState('hasFocus', 'setFocus', false)
)(MultiInput);
