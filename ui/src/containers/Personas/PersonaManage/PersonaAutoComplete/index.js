import React, { PropTypes } from 'react';
import { compose, setPropTypes } from 'recompose';
import { fromJS, Map } from 'immutable';
import ModelAutoComplete from 'ui/containers/ModelAutoComplete';

const enhance = compose(
  setPropTypes({
    currentPersonaId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    selectedPersonaId: PropTypes.string,
  })
);

const sort = new Map({ name: 1, _id: 1 });

const searchStringToFilter = (searchString) => {
  switch (searchString) {
    case '':
      return new Map();
    default:
      return fromJS({ name: { $regex: searchString, $options: 'i' } });
  }
};

// Prevents merging of a persona into itself, etc.
const removeCurrentPersonaFilter = (currentPersonaId) => {
  return fromJS({
    _id: { $ne: { $oid: currentPersonaId } }
  });
};

const getPersonaName = (persona) => {
  return persona.get('name');
};

const render = ({ selectedPersonaId, currentPersonaId, onChange }) => {
  return (
    <ModelAutoComplete
      filter={removeCurrentPersonaFilter(currentPersonaId)}
      sort={sort}
      schema="persona"
      searchStringToFilter={searchStringToFilter}
      id={selectedPersonaId}
      parseOption={getPersonaName}
      parseOptionTooltip={getPersonaName}
      onChange={onChange} />
  );
};

export default render;