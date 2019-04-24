import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps, setPropTypes } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import createPersonaIdentFilter from '../createPersonaIdentFilter';
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
  withStyles(styles)
);

const IdentifiersViewer = ({ models }) => {
  if (models.count() === 0) {
    return (
      <div>
        No identifiers.
      </div>
    );
  }
  return (
    <div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.td}>Type</th>
            <th className={styles.td}>Value</th>
          </tr>
        </thead>
        <tbody>
          {models.map(model => (
            <SavedRow key={model.get('_id')} id={model.get('_id')} />
          )).valueSeq()}
        </tbody>
      </table>
    </div>
  );
};

export default enhance(IdentifiersViewer);
