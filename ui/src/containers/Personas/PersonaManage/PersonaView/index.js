/* eslint-disable react/jsx-indent */
import React, { Component, PropTypes } from 'react';
import { compose, withProps, setPropTypes, defaultProps, withState } from 'recompose';
import { Map } from 'immutable';
import Tabs from 'ui/components/Material/Tabs';
import { Tab } from 'react-toolbox/lib/tabs';
import { withModel } from 'ui/utils/hocs';
import LabelledInput from 'ui/components/Input/LabelledInput';
import MergeForm from '../MergeForm';
import IdentifiersEditor from '../IdentifiersEditor';
import AttributesEditor from '../AttributesEditor';

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
    return <MergeForm id={model.get('_id')} />
  } else {
    return (
      <div>
        <LabelledInput label="Name" value={name} onChange={handleNameChange} />
        <Tabs index={activeTab} onChange={setActiveTab}>
          <Tab label="Identifiers">
            <IdentifiersEditor personaId={model.get('_id')} />
          </Tab>
          <Tab label="Attributes">
            <AttributesEditor personaId={model.get('_id')} />
          </Tab>
          <Tab label="Merge">
            <MergeForm id={model.get('_id')} />
          </Tab>
        </Tabs>
      </div>
    );
  }
};

export default enhance(render);
