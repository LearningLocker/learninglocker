import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { compose, renameProp, withProps, setPropTypes, withStateHandlers } from 'recompose';
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
        first: 100,
      }),
  ),
  withModels,
  renameProp('models', 'attributes'),
  withStateHandlers(
    () => ({ showAddForm: false }),
    {
      setShowAddFormFalse: () => () => ({ showAddForm: false }),
      setShowAddFormTrue: () => () => ({ showAddForm: true }),
    }
  )
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

const renderAddForm = ({ showAddForm, setShowAddFormTrue, setShowAddFormFalse }) => (
  showAddForm ? (
    <PersonaAttributeForm onDone={setShowAddFormFalse} />
  ) : (
    <div className="clearfix">
      <button
        className="btn btn-primary btn-sm pull-right"
        onClick={setShowAddFormTrue}>
        <i className="ion ion-plus" /> Add attribute
      </button>
    </div>
  )
);

const personaAttributes = ({
  attributes,
  showAddForm,
  setShowAddFormTrue,
  setShowAddFormFalse
}) => (
  <div>
    {renderAddForm({ showAddForm, setShowAddFormTrue, setShowAddFormFalse })}
    {renderItems(attributes)}
  </div>
);

export default enhance(personaAttributes);
