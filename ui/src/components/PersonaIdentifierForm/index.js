import React from 'react';
import { compose, withHandlers } from 'recompose';

const handlers = withHandlers({
  onIdentifierTypeChange: ({
      handleIdentifierTypeChange,
      handleIdentifierValueChange
    }) => (event) => {
      const value = event.target.value;

      handleIdentifierTypeChange(value);
      if (value === 'account') {
        handleIdentifierValueChange({
          homePage: '',
          name: ''
        });
      } else {
        handleIdentifierValueChange('');
      }
    },

  onIdentifierValueChange: ({
    handleIdentifierValueChange,
  }) => (event) => {
    const value = event.target.value;
    handleIdentifierValueChange(value);
  },

  onIdentifierValueHomePageChange: ({
    handleIdentifierValueChange,
    identifierValue
  }) => (event) => {
    const value = event.target.value;
    identifierValue.homePage = value;
    handleIdentifierValueChange(identifierValue);
  },

  onIdentifierValueNameChange: ({
    handleIdentifierValueChange,
    identifierValue
  }) => (event) => {
    const value = event.target.value;
    identifierValue.name = value;
    handleIdentifierValueChange(identifierValue);
  }
});

const PersonaIdentifierFormComponent = ({
  onIdentifierTypeChange,
  onIdentifierValueChange,
  onIdentifierValueHomePageChange,
  onIdentifierValueNameChange,
  identifierType,
  identifierValue
}) => (
  <form>
    <div className="form-group">
      <label
        htmlFor="persona-identifier-type-form"
        id="basic-addon3">
        Type
      </label>
      <select
        className="form-control"
        id="persona-identifier-type-form"
        onChange={onIdentifierTypeChange}
        value={identifierType}>

        <option value="mbox">mbox</option>
        <option value="mbox_sha1sum">mbox_sha1sum</option>
        <option value="openid">openid</option>
        <option value="account">account</option>
      </select>

    </div>

    {identifierType !== 'account' && <div className="form-group">
      <label
        htmlFor="persona-identifier-value-form" >
          Value
      </label>
      <input
        id="persona-identifier-value-form"
        className="form-control"
        onChange={onIdentifierValueChange}
        type="text"
        value={identifierValue} />
    </div>}

    {
      identifierType === 'account' && <div>
        <div className="form-group">
          <label
            htmlFor="persona-identifier-value-homePage-form">
            Home page
          </label>
          <input
            id="persona-identifier-value-homePage-form"
            className="form-control"
            onChange={onIdentifierValueHomePageChange}
            type="text"
            value={identifierValue.homePage} />
        </div>
        <div className="form-group">
          <label
            htmlFor="persona-identifier-value-name-form">
            Name
          </label>
          <input
            id="persona-identifier-value-name-form"
            className="form-control"
            onChange={onIdentifierValueNameChange}
            type="text"
            value={identifierValue.name} />
        </div>
      </div>
    }
  </form>
);

export default compose(
  handlers
)(PersonaIdentifierFormComponent);
