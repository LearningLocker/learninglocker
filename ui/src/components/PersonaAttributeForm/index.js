import React from 'react';
import { compose, withStateHandlers } from 'recompose';

const handlers = withStateHandlers(
  ({ attribute = {} }) => ({
    key: attribute.key,
    value: attribute.value
  }),
  {
    changeKey: () => event => ({ key: event.target.value }),
    changeValue: () => event => ({ value: event.target.value }),
  }
);

const PersonaAttributeFormComponent = ({
  changeKey,
  changeValue,
  key,
  value
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
          onChange={changeKey}
          type="text"
          value={key} />
      </div>

      <div className="form-group">
        <label
          htmlFor="persona-attribute-value-form" >
            Value
        </label>
        <input
          id="persona-attribute-value-form"
          className="form-control"
          onChange={changeValue}
          type="text"
          value={value} />
      </div>
    </form>
  );
};

export default compose(
  handlers
)(PersonaAttributeFormComponent);
