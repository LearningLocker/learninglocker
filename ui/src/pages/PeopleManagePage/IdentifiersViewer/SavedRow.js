import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import { identifierTypeDisplays } from '../constants';
import IfiViewer from '../IfiViewer';
import styles from './styles.css';

const enhance = compose(
  withProps({ schema: 'personaIdentifier' }),
  withModel,
  withStyles(styles)
);

const render = ({ model }) => {
  const identifierType = model.getIn(['ifi', 'key']);
  const identifierValue = model.getIn(['ifi', 'value']);
  return (
    <tr>
      <td className={styles.td}>
        {identifierTypeDisplays[identifierType]}
      </td>
      <td className={styles.td}>
        <IfiViewer identifierType={identifierType} identifierValue={identifierValue} />
      </td>
    </tr>
  );
};

export default enhance(render);
