import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps, setPropTypes } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import SavedRow from './SavedRow';
import styles from './styles.css';

const enhance = compose(
  setPropTypes({
    personaId: PropTypes.string.isRequired,
  }),
  withProps(({ personaId }) => ({
    filter: new Map({ persona: personaId }),
    schema: 'personaIdentifier',
    first: 100,
    sort: new Map({ _id: -1 }),
  })),
  withModels,
  withStyles(styles)
);

const render = ({ personaId, models }) => {
  if (models.count() === 0) {
    return (
      <div>
        No identifiers.
      </div>
    );
  } else {
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
            {models.map((model) => {
              return <SavedRow id={model.get('_id')} />;
            }).valueSeq()}
          </tbody>
        </table>
      </div>
    );
  }
};

export default enhance(render);
