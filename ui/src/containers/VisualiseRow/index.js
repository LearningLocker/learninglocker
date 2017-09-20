import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { modelsSchemaIdSelector } from 'ui/redux/modules/models';
import VisualiseIcon from 'ui/components/VisualiseIcon';
import styles from './visualiserow.css';

const VisualiseRow = connect((state, ownProps) => {
  const ownerId = ownProps.model.get('owner');
  const owner = modelsSchemaIdSelector('user', ownerId)(state);
  return {
    ownerName: owner.get('name', 'Unknown'),
  };
})(({ active, onClick, ownerName, model }) => {
  const type = model.get('type');
  const description = model.get('description');

  const classes = classNames({
    [styles['visualisation-row']]: true,
    [styles.active]: active
  });

  return (
    <tr className={classes} onClick={onClick}>
      <td><VisualiseIcon type={type} isSmall /></td>
      <td>{description}</td>
      <td>{ownerName}</td>
    </tr>
  );
});

export default withStyles(styles)(VisualiseRow);
