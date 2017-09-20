import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { compose, setPropTypes, withState, withHandlers } from 'recompose';
import { assignPersona } from 'ui/redux/modules/people';
import PersonaIdentifier from 'ui/components/PersonaIdentifier';
import PersonaScore from './PersonaScore';

const enhance = compose(
  setPropTypes({
    model: PropTypes.object.isRequired,
  }),
  connect(() => ({}), { assignPersona }),
  withState('showIdentifiers', 'setShowIdentifiers', false),
  withHandlers({
    handleToggle: ({ showIdentifiers, setShowIdentifiers }) =>
      (event) => {
        event.preventDefault();
        setShowIdentifiers(!showIdentifiers);
      },
    handleReconcile: ({ model, ...props }) =>
      (personaScore, event) => {
        event.preventDefault();
        const newPersonaId = personaScore.get('persona').get('_id');
        const personaIdentifierId = model.get('_id');
        props.assignPersona(newPersonaId, personaIdentifierId);
      },
  })
);

const render = ({
  model,
  handleReconcile,
  showIdentifiers,
  handleToggle,
}) => {
  const personaScores = model.get('personaScores');
  const sortedPersonaScores = personaScores.sort((valA, valB) => {
    const scoreA = parseInt(valA.get('score'), 10);
    const scoreB = parseInt(valB.get('score'), 10);
    if (scoreA === scoreB) return 0;
    return scoreA > scoreB ? -1 : 1;
  });
  const personaRows = sortedPersonaScores.map((personaScore, key) =>
    <PersonaScore
      key={key}
      handleReconcile={handleReconcile}
      personaScore={personaScore} />
  );

  const identityIconClasses = classNames({
    icon: true,
    'ion-chevron-right': !showIdentifiers,
    'ion-chevron-down': showIdentifiers
  });

  return (
    <div>
      <button id="toggle" className="btn btn-primary btn-sm" onClick={handleToggle}>
        <i className={identityIconClasses} /> View identity information
      </button>
      { showIdentifiers &&
        <PersonaIdentifier model={model} />
      }
      <hr />
      { sortedPersonaScores.size > 0 && (
        <div>
          <h4>Suggested personas:</h4>
          <table className="table table-striped" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th>Persona</th>
                <th className="text-center">Score</th>
                <th />
              </tr>
            </thead>
            { personaRows }
          </table>
        </div>
      )}
    </div>
  );
};

export default enhance(render);
