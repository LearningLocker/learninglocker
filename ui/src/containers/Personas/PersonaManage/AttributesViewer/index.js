import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Map } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps, setPropTypes } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import styles from '../styles.css';
import SavedRow from './SavedRow';

const enhance = compose(
  setPropTypes({
    personaId: PropTypes.string.isRequired,
  }),
  withProps(({ personaId }) => ({
    filter: new Map({ personaId }),
    schema: 'personaAttribute',
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
        No attributes.
      </div>
    );
  } else {
    return (
      <div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.td}>Name</th>
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
