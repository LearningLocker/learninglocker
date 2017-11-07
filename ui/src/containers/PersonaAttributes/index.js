import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { compose, renameProp, withProps, setPropTypes, withState } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import KeyValueIdent from 'ui/components/KeyValueIdent';
import PersonaAttributeForm from 'ui/components/PersonaAttributeForm';

const enhance = compose(
  setPropTypes({
    personaId: PropTypes.string,
    attributes: PropTypes.instanceOf(Map),
  }),
  withProps(
    ({ personaId }) =>
      ({
        filter: new Map({ personaId }),
        schema: 'personaAttribute',
      }),
  ),
  withModels,
  renameProp('models', 'attributes'),
  withState('showAddForm', 'setShowAddForm', false)
);

const renderItems = items => items.map((item) => {
  if (typeof item !== 'string') {
    return (<div>
      <KeyValueIdent
        ident={item} />
    </div>);
  }
  return null;
}).valueSeq();

const renderAddForm = ({ showAddForm, setShowAddForm }) => (
  showAddForm ? (
    <PersonaAttributeForm onDone={setShowAddForm.bind(null, false)} />
  ) : (
    <div className="clearfix">
      <button
        className="btn btn-primary btn-sm pull-right"
        onClick={setShowAddForm.bind(null, true)}>
        <i className="ion ion-plus" /> Add attribute
      </button>
    </div>
  )
);

const personaAttributes = ({
  attributes,
  showAddForm,
  setShowAddForm
}) => (
  <div>
    {renderAddForm({ showAddForm, setShowAddForm })}
    {renderItems(attributes)}
  </div>
);

export default enhance(personaAttributes);
