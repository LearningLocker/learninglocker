import React, { PropTypes } from 'react';
import KeyValueIdent from 'ui/components/KeyValueIdent';
import PersonaIdentifierForm from 'ui/components/PersonaIdentifierForm';
import { Map } from 'immutable';
import { compose, renameProp, withProps, setPropTypes, withStateHandlers } from 'recompose';
import { withModels } from 'ui/utils/hocs';

const enhance = compose(
  setPropTypes({
    personaId: PropTypes.string,
    personaIdentifiers: PropTypes.instanceOf(Map),
  }),
  withProps(
    ({ personaId }) =>
      ({
        filter: new Map({ persona: personaId }),
        schema: 'personaIdentifier',
      }),
  ),
  withModels,
  renameProp('models', 'personaIdentifiers'),
  withStateHandlers(
    () => ({ showAddForm: false }),
    {
      setShowAddFormFalse: () => () => ({ showAddForm: false }),
      setShowAddFormTrue: () => () => ({ showAddForm: true }),
    }
  ),
);

const renderItems = items => items.map((item) => {
  if (typeof item !== 'string') {
    return (
      <KeyValueIdent
        ident={item.get('ifi')}
        path={['ifi']}
        key={item.get('_id')}
        schema="personaIdentifier"
        id={item.get('_id')} />
    );
  }
  return null;
}).valueSeq();

const renderAddForm = ({ showAddForm, setShowAddFormFalse, setShowAddFormTrue }) => (
  <dl className="dl-horizontal clearfix">{
    showAddForm ? (
      <PersonaIdentifierForm onCancel={setShowAddFormFalse} />
    ) : (
      <button
        className="btn btn-primary btn-sm pull-right"
        onClick={setShowAddFormTrue}>
        <i className="ion ion-plus" /> Add identity
      </button>
    )
  }</dl>
);

const PersonaIdentifiersComponent = ({
  personaIdentifiers,
  showAddForm,
  setShowAddFormFalse,
  setShowAddFormTrue
}) => (
  <div>
    {renderAddForm({ showAddForm, setShowAddFormFalse, setShowAddFormTrue })}
    {renderItems(personaIdentifiers)}
  </div>
);

export default enhance(PersonaIdentifiersComponent);
