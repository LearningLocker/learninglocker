import React from 'react';
import { Map } from 'immutable';
import { compose, withProps } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import { getUniqueIdentifierDisplayName } from 'lib/constants/statements';
import CreatePersonaButton from 'ui/containers/CreatePersonaButton';
import ModelList from 'ui/containers/ModelList';
import ReconcilePersonaIdentifier from 'ui/containers/PersonaReconcile/ReconcilePersonaIdentifier';

const schema = 'personaIdentifier';
const getPersonaIdentifierTitle = personaIdentifier =>
  getUniqueIdentifierDisplayName(personaIdentifier.get('uniqueIdentifier').toJS());

const ReconcileList = compose(
  withProps({
    schema,
    sort: new Map({ title: 1, _id: -1 }),
    filter: new Map({ persona: null }),
    fetchParams: { populate: {
      path: 'personaScores.persona',
      populate: {
        path: 'personaIdentifiers',
        model: 'PersonaIdentifier'
      }
    } },
  }),
  withModels,
  withProps({
    getDescription: getPersonaIdentifierTitle,
    ModelForm: ReconcilePersonaIdentifier,
    buttons: [CreatePersonaButton],
  })
)(ModelList);

export default () =>
  (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
            People - Reconcile
        </div>
      </header>
      <div className="row">
        <ReconcileList />
      </div>
    </div>
  );
