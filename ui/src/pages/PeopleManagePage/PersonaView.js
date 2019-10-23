/* eslint-disable react/jsx-indent */
import React from 'react';
import PropTypes from 'prop-types';
import { compose, withProps, setPropTypes, defaultProps } from 'recompose';
import { Map } from 'immutable';
import Tabs from 'ui/components/Material/Tabs';
import { Tab } from 'react-toolbox/lib/tabs';
import { withModel } from 'ui/utils/hocs';
import LabelledInput from 'ui/components/Input/LabelledInput';
import MergeForm from './MergeForm';
import IdentifiersEditor from './IdentifiersEditor';
import AttributesEditor from './AttributesEditor';

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
  withModel
);

const render = ({ model, getMetadata, setMetadata, updateModel }) => {
  const showMergeForm = getMetadata('isMergeFormVisible', false);
  const activeTab = getMetadata('personaViewActiveTab', 0);
  const name = model.get('name') || '';
  const handleNameChange = (value) => {
    updateModel({ path: ['name'], value });
  };
  const handleTabChange = (newActiveTab) => {
    setMetadata('personaViewActiveTab', newActiveTab);
  };

  if (showMergeForm) {
    return <MergeForm id={model.get('_id')} />;
  }
  return (
    <div>
      <LabelledInput label="Name" value={name} onChange={handleNameChange} />
      <Tabs index={activeTab} onChange={handleTabChange}>
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
};

export default enhance(render);
