import React, { PropTypes } from 'react';
import { Map, List } from 'immutable';
import classNames from 'classnames';
import { compose, setPropTypes, withProps, withHandlers, withState } from 'recompose';
import { withModel, withModels } from 'ui/utils/hocs';
import PersonaIdentifier from 'ui/components/PersonaIdentifier';

const PersonaIdentifiers = compose(
  setPropTypes({
    ids: PropTypes.instanceOf(List).isRequired,
  }),
  withProps(({ ids }) => ({
    schema: 'personaIdentifier',
    filter: new Map({
      _id: new Map({
        $in: ids,
      }),
    }),
  })),
  withModels
)(({ models }) =>
  (
    <div>
      {models.map((model, key) =>
        <PersonaIdentifier key={key} model={model} />
      ).valueSeq()}
    </div>
  )
);

const enhance = compose(
  setPropTypes({
    handleReconcile: PropTypes.func.isRequired,
    personaScore: PropTypes.instanceOf(Map).isRequired,
  }),
  withState('scoredPersonaVisibility', 'setScoredPersonaVisibility', new Map({})),
  withHandlers({
    toggleViewInfo: ({ scoredPersonaVisibility, setScoredPersonaVisibility, personaScore }) =>
      (event) => {
        event.preventDefault();
        const personaScoreID = personaScore.get('_id');
        const infoVisible = scoredPersonaVisibility.get(personaScoreID, false);
        setScoredPersonaVisibility(scoredPersonaVisibility.set(personaScoreID, !infoVisible));
      },
    handleReconcile: ({ handleReconcile, personaScore }) =>
      (event) => {
        handleReconcile(personaScore, event);
      },
  }),
  withProps(({ personaScore }) => ({
    schema: 'persona',
    id: personaScore.get('persona'),
  })),
  withModel
);

const render = ({
  scoredPersonaVisibility,
  toggleViewInfo,
  handleReconcile,
  personaScore,
  model = new Map({ name: 'Unknown', personaIdentifiers: new List() }),
}) => {
  const tdStyle = { verticalAlign: 'middle' };
  const personaScoreID = personaScore.get('_id');
  const infoVisible = scoredPersonaVisibility.get(personaScoreID, false);

  const infoVisibleIconClasses = classNames({
    icon: true,
    'ion-chevron-right': !infoVisible,
    'ion-chevron-down': infoVisible
  });

  return (
    <tbody key={personaScoreID}>
      <tr>
        <td style={tdStyle}>{model.get('name')}</td>
        <td style={tdStyle} className="text-center">{ parseFloat(personaScore.get('score'), 2).toFixed(2) }</td>
        <td style={tdStyle} className="text-right">
          <a className="btn btn-primary btn-sm" onClick={toggleViewInfo}>
            <i className={infoVisibleIconClasses} /> View info
          </a>
          {' '}
          <a className="btn btn-primary btn-sm" title="Assign this identity to this persona" onClick={handleReconcile}>
            <i className="icon ion-checkmark" />
          </a>
        </td>
      </tr>
      { infoVisible &&
        <tr>
          <td colSpan="3">
            <h3>{model.get('name')}</h3>
            <h4>Scoring information</h4>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th className="text-left">Key</th>
                  <th className="text-center">Score</th>
                  <th className="text-right">Value</th>
                  <th className="text-right">Compared to</th>
                </tr>
              </thead>
              <tbody>
                { personaScore.get('matches').map((match, index) => (
                  <tr key={index}>
                    <td className="text-left">{ match.get('key')}</td>
                    <td className="text-center">{ match.get('score').toFixed(2) }</td>
                    <td className="text-right">{ match.get('value')}</td>
                    <td className="text-right">{ match.get('comparedValue')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr />
            <PersonaIdentifiers ids={model.get('personaIdentifiers', new List())} />
          </td>
        </tr>
      }
    </tbody>
  );
};

export default enhance(render);
