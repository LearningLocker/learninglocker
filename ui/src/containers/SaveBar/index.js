import React from 'react';
import { List } from 'immutable';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { omitBy, isFunction } from 'lodash';
import { compose } from 'recompose';
import classNames from 'classnames';
import SaveBarErrors from 'ui/containers/SaveBarErrors';
import styles from './styles.css';

export const savingSelector = () => createSelector(
  state =>
    state.models.map(model =>
      model.filter(item =>
        item && item.getIn &&
          (
            !!item.getIn(['remoteCache', 'requestState']) ||
            !!item.getIn(['deleteState'])
          )
      )
    ).toList().flatMap((model) => {
      const out = model.toList().flatMap((item) => {
        // item && item.getIn && item.getIn(['remoteCache', 'requestState'])
        const out2 = new List([
          item && item.getIn && item.getIn(['remoteCache', 'requestState']),
          item && item.getIn && item.getIn(['deleteState'])
        ]);
        return out2;
      });

      return out;
    }),
  (saving) => {
    if (saving.includes(IN_PROGRESS)) {
      return IN_PROGRESS;
    }
    if (saving.includes(FAILED)) {
      return FAILED;
    }
    if (saving.includes(COMPLETED)) {
      return COMPLETED;
    }
    return false;
  }
);

const getLabel = (value) => {
  switch (value) {
    case IN_PROGRESS:
      return 'SAVING';
    case COMPLETED:
      return 'SAVED';
    case FAILED:
      return 'SAVE FAILED';
    default:
      return '';
  }
};

const SaveBar = ({
  saving
}) => {
  const styles2 = omitBy(styles, isFunction);

  return (
    <div className={styles.container}>
      {saving && <ProgressBar
        className={styles2[saving.toLowerCase()]}
        mode={saving === IN_PROGRESS ? 'indeterminate' : 'determinate'}
        value={100}
        theme={styles2} />
      }
      {saving && <div className={classNames(styles.label, styles2[saving.toLowerCase()])}>{getLabel(saving)}</div>}
      <SaveBarErrors />
    </div>);
};

const SaveBarComposed = compose(
  withStyles(styles),
  connect(
    state => ({
      saving: savingSelector()(state)
    })
  )
)(SaveBar);

export default SaveBarComposed;
