import React from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { omitBy, isFunction } from 'lodash';
import { compose } from 'recompose';
import classNames from 'classnames';
import styles from './styles.css';

export const savingSelector = () => createSelector(
  state =>
    state.models.filter(model =>
      model.filter(item =>
        item && item.getIn && !!item.getIn(['remoteCache', 'requestState'])
      )
    ).flatMap(model =>
      model.map(item =>
        item && item.getIn && item.getIn(['remoteCache', 'requestState'])
      )
    )
  ,
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
  if (!saving) {
    return (<div className={styles.container} />);
  }

  const styles2 = omitBy(styles, isFunction);

  return (
    <div className={styles.container}>
      <ProgressBar
        className={styles2[saving.toLowerCase()]}
        mode={saving === IN_PROGRESS ? 'indeterminate' : 'determinate'}
        value={100}
        theme={styles2} />
      <div className={classNames(styles.label, styles2[saving.toLowerCase()])}>{getLabel(saving)}</div>
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
