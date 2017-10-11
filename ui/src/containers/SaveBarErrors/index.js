import React from 'react';
import { compose, withHandlers } from 'recompose';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { getAlertsSelector, deleteAlert } from 'ui/redux/modules/alerts';
import styles from './styles.css';

const onRemove = ({ deleteAlert: deleteAlert2 }) => key => () => deleteAlert2({ key });

const SaveBarErrors = ({
  onRemove: onRemove2,
  alerts,
}) =>
  (<div className={styles.container}>
    {alerts.map((message, key) =>
      <div className="alert alert-danger alert-dismissible" role="alert" key={key}>
        <button onClick={onRemove2(key)} type="button" className="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        {message.message}
      </div>
    )}
  </div>);

const SaveBarComposed = compose(
  connect(
    state => ({
      alerts: getAlertsSelector(state)
    }),
    {
      deleteAlert
    }
  ),
  withStyles(styles),
  withHandlers({
    onRemove
  })
)(SaveBarErrors);

export default SaveBarComposed;
