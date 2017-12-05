import React from 'react';
import { Map } from 'immutable';
import { compose, withStateHandlers, withHandlers } from 'recompose';

const stateHandlers = withStateHandlers(
  ({ attribute = new Map() }) => ({
    attributeKey: attribute.get('key', ''),
    attributeValue: attribute.get('value', '')
  }),
  {
    onChangeKey: () => event => ({ attributeKey: event.target.value }),
    onChangeValue: () => event => ({ attributeValue: event.target.value }),
  }
);

const withOnCancelHandler = withHandlers({
  onClickCancel: ({ onCancel }) => (event) => {
    event.preventDefault();
    onCancel();
  }
});

const withOnSubmitHandler = withHandlers({
  onClickSubmit: ({ onSubmit, attributeKey, attributeValue }) => (event) => {
    event.preventDefault();
    onSubmit({ key: attributeKey, value: attributeValue });
  }
});

const PersonaAttributeFormComponent = ({
  onChangeKey,
  onChangeValue,
  onClickCancel,
  onClickSubmit,
  attributeKey,
  attributeValue
}) => (
  <form className="form-inline">
    <div className="form-group">
      <input
        autoFocus
        id="persona-attribute-key-form"
        className="form-control"
        onChange={onChangeKey}
        placeholder="Key"
        type="text"
        value={attributeKey} />
    </div>

    <div className="form-group">
      <input
        id="persona-attribute-value-form"
        className="form-control"
        onChange={onChangeValue}
        placeholder="Value"
        type="text"
        value={attributeValue} />
    </div>
    <button
      className="btn btn-primary btn-sm pull-right"
      onClick={onClickSubmit} >
      <i className="ion ion-plus" /> Submit
    </button>
    <button
      className="btn btn-primary btn-sm pull-right"
      onClick={onClickCancel} >
      <i className="ion ion-plus" /> Cancel
    </button>
  </form>
);

export default compose(
  stateHandlers,
  withOnCancelHandler,
  withOnSubmitHandler
)(PersonaAttributeFormComponent);
