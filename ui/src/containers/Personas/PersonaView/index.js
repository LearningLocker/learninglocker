/* eslint-disable react/jsx-indent */
import React, { Component, PropTypes } from 'react';
import { compose, withProps, setPropTypes, defaultProps, withState } from 'recompose';
import { Map } from 'immutable';
import Tabs from 'ui/components/Material/Tabs';
import { Tab } from 'react-toolbox/lib/tabs';
import { withModel } from 'ui/utils/hocs';
import PersonaMergeForm from 'ui/containers/Personas/PersonaMergeForm';
import PersonaIdentifiers from 'ui/containers/Personas/PersonaIdentifiers';
import PersonaAttributes from 'ui/containers/Personas/PersonaAttributes';
import LabelledInput from 'ui/components/Input/LabelledInput';

const enhance = compose(
  setPropTypes({
    model: PropTypes.instanceOf(Map),
  }),
  defaultProps({
    model: new Map(),
  }),
  withProps(({ model }) => ({
    schema: 'persona',
    id: model.get('_id'),
  })),
  withState('activeTab', 'setActiveTab', 0),
  withModel
);

const render = ({ model, getMetadata, activeTab, setActiveTab, updateModel }) => {
  const showMergeForm = getMetadata('isMergeFormVisible', false);
  const name = model.get('name') || '';
  const handleNameChange = (e) => {
    updateModel({ path: ['name'], value: e.target.value });
  };

  if (showMergeForm) {
    return <PersonaMergeForm id={model.get('_id')} />
  } else {
    return (
      <div>
        <LabelledInput label="Name" value={name} onChange={handleNameChange} />
        <Tabs index={activeTab} onChange={setActiveTab}>
          <Tab label="Identifiers">
            <PersonaIdentifiers personaId={model.get('_id')} />
          </Tab>
          <Tab label="Attributes">
            <PersonaAttributes personaId={model.get('_id')} />
          </Tab>
        </Tabs>
      </div>
    );
  }
};

export default enhance(render);
