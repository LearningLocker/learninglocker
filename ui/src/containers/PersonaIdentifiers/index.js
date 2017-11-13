import React, { PropTypes } from 'react';
import PersonaIdentifier from 'ui/components/PersonaIdentifier';
import PersonaIdentifierForm from 'ui/components/PersonaIdentifierForm';
import { Map } from 'immutable';
import { compose, renameProp, withProps, setPropTypes, withState } from 'recompose';
import { withModels } from 'ui/utils/hocs';


// {showAddForm &&
//

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
  withState('showAddForm', 'setShowAddForm', false)
);

const renderItems = items => items.map((item) => {
  if (typeof item !== 'string') {
    return <PersonaIdentifier model={item} key={item.get('_id')} />;
  }
  return null;
}).valueSeq();

const renderAddForm = ({ showAddForm, setShowAddForm }) => (
  showAddForm ? (
    <PersonaIdentifierForm />
  ) : (
    <div className="clearfix">
      <button
        className="btn btn-primary btn-sm pull-right"
        onClick={() => setShowAddForm(true)}>
        <i className="ion ion-plus" /> Add identity
      </button>
    </div>
  )
);

const PersonaIdentifiersComponent = ({
  personaIdentifiers,
  showAddForm,
  setShowAddForm
}) => (
  <div>
    {renderAddForm({ showAddForm, setShowAddForm })}
    {renderItems(personaIdentifiers)}
  </div>
);

export default enhance(PersonaIdentifiersComponent);
