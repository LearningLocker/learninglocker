import React, { useState } from 'react';
import FocusGroup from 'ui/components/FocusGroup/FocusGroup';

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
    <div onKeyPress={onKeyPress} style={{ position: 'relative', flexGrow: 1 }}>
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
    </div>
  );
};

export default AutoComplete;
