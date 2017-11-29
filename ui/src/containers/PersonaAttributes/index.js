import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { compose, renameProp, withProps, setPropTypes, withStateHandlers, withHandlers } from 'recompose';
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
  ),
  withHandlers({
    onSubmit: ({ addModel, setShowAddFormFalse, personaId }) => ({ key, value }) => {
      addModel({ props: { key, value, personaId } });
      setShowAddFormFalse();
    }
  })
);

const renderItems = items => items.map((item) => {
  if (typeof item !== 'string') {
    return (
      <KeyValueIdent
        key={item.get('_id')}
        ident={item}
        id={item.get('_id')}
        schema="personaAttribute" />
    );
  }
  return null;
}).valueSeq();

const renderAddForm = ({ showAddForm, setShowAddFormTrue, setShowAddFormFalse, onSubmit }) => (
  <dl className="dl-horizontal clearfix">{
    showAddForm ? (
      <PersonaAttributeForm onCancel={setShowAddFormFalse} onSubmit={onSubmit} />
    ) : (
      <button
        className="btn btn-primary btn-sm pull-right"
        onClick={setShowAddFormTrue}>
        <i className="ion ion-plus" /> Add attribute
      </button>
    )
  }</dl>
);

const personaAttributes = ({
  attributes,
  showAddForm,
  onSubmit,
  setShowAddFormTrue,
  setShowAddFormFalse
}) => (
  <div>
    {renderAddForm({ showAddForm, setShowAddFormTrue, setShowAddFormFalse, onSubmit })}
    {renderItems(attributes)}
  </div>
);

export default enhance(personaAttributes);
