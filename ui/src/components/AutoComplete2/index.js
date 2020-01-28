import React, { useState } from 'react';
import styled from 'styled-components';
import FocusGroup from 'ui/components/FocusGroup/FocusGroup';

const AutoCompleteWrapper = styled.div`
  position: relative;
  flex-grow: 1;
`;

/**
 * renders an autocomplete component with an input and suggestions
 */
const AutoComplete = ({
  // renderers
  renderOptions = () => { },
  renderInput = () => { },

  // event handlers
  onKeyPress,
}) => {
  const [hasInputFocus, setInputFocus] = useState(false);
  const onBlurInput = () => {
    setInputFocus(false);
  };

  return (
    <AutoCompleteWrapper onKeyPress={onKeyPress}>
      <FocusGroup
        onFocus={() => { }}
        onBlur={onBlurInput}
        hasFocus={hasInputFocus} >
        {renderInput({
          onFocus: () => setInputFocus(true),
          hasFocus: hasInputFocus
        })}
        <div
          style={{ position: 'absolute', zIndex: 1, width: '100%' }}>
          {hasInputFocus &&
            renderOptions({ onKeyPress, onBlur: onBlurInput })
          }
        </div>
      </FocusGroup>
    </AutoCompleteWrapper>
  );
};

export default AutoComplete;
