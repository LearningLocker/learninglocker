import React from 'react';
import { compose, withHandlers } from 'recompose';

const handlers = withHandlers({
  onAttributeKeyChange: ({
    handleAttributeKeyChange,
  }) => (event) => {
    const value = event.target.value;
    handleAttributeKeyChange(value);
  },
  onAttributeValueChange: ({
    handleAttributeValueChange,
  }) => (event) => {
    const value = event.target.value;
    handleAttributeValueChange(value);
  }
});

const PersonaAttributeFormComponent = ({
  onAttributeKeyChange,
  onAttributeValueChange,
  attributeKey,
  attributeValue
}) => {
  return (
    <form>
      <div className="form-group">
        <label
          htmlFor="persona-attribute-key-form" >
            Key
        </label>
        <input
          id="persona-attribute-key-form"
          className="form-control"
          onChange={onAttributeKeyChange}
          type="text"
          value={attributeKey} />
      </div>

      <div className="form-group">
        <label
          htmlFor="persona-attribute-value-form" >
            Value
        </label>
        <input
          id="persona-attribute-value-form"
          className="form-control"
          onChange={onAttributeValueChange}
          type="text"
          value={attributeValue} />
      </div>
    </form>
  );
};

export default compose(
  handlers
)(PersonaAttributeFormComponent);
