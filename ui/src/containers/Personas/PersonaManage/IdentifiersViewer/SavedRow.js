import React, { PropTypes } from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import styles from '../styles.css';
import IfiViewer from '../IfiViewer';

const enhance = compose(
  withProps({ schema: 'personaIdentifier' }),
  withModel,
  withStyles(styles)
);

const render = ({ model, deleteModel }) => {
  const identifierType = model.getIn(['ifi', 'key']);
  const identifierValue = model.getIn(['ifi', 'value']);
  return (
    <tr>
      <td className={styles.td}>
        {identifierType}
      </td>
      <td className={styles.td}>
        <IfiViewer identifierType={identifierType} identifierValue={identifierValue} />
      </td>
    </tr>
  );
};

export default enhance(render);