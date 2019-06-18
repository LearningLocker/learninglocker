import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Map } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps, setPropTypes, withState } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import AddTextIconButton from 'ui/components/TextIconButton/AddTextIconButton';
import createPersonaIdentFilter from '../createPersonaIdentFilter';
import NewRow from './NewRow';
import SavedRow from './SavedRow';
import styles from './styles.css';

const enhance = compose(
  setPropTypes({
    personaId: PropTypes.string.isRequired,
  }),
  withProps(({ personaId }) => ({
    filter: createPersonaIdentFilter(personaId),
    schema: 'personaIdentifier',
    first: 100,
    sort: new Map({ _id: -1 }),
  })),
  withModels,
  withState('isNewIdentifierVisible', 'changeNewIdentifierVisibility', false),
  withStyles(styles)
);

const render = ({
  personaId,
  models,
  isNewIdentifierVisible,
  changeNewIdentifierVisibility,
  addModel,
}) => {
  const handleNewRowAdd = (key, value) => {
    const props = new Map({
      ifi: new Map({ key, value }),
      persona: personaId,
    });
    addModel({ props });
  };
  const handleNewRowCancel = () => {
    changeNewIdentifierVisibility(false);
  };
  return (
    <div>
      <div className={styles.buttons}>
        <AddTextIconButton
          text="Add Identifier"
          onClick={() => changeNewIdentifierVisibility(true)} />
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.td}>Type</th>
            <th className={styles.td}>Value</th>
            <th className={classNames(styles.td, styles.actions)}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!isNewIdentifierVisible ? null : (
            <NewRow onAdd={handleNewRowAdd} onCancel={handleNewRowCancel} />
          )}
          {models.map(model => (
            <SavedRow
              id={model.get('_id')}
              key={model.get('_id')} />
          )).valueSeq()}
        </tbody>
      </table>
    </div>
  );
};

export default enhance(render);
