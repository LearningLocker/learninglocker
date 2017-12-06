import React, { PropTypes } from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import EditIconButton from 'ui/components/IconButton/EditIconButton';
import DeleteIconButton from 'ui/components/IconButton/DeleteIconButton';
import styles from './styles.css';

const enhanceSavedIdentifier = compose(
  withProps({ schema: 'personaIdentifier' }),
  withModel,
  withStyles(styles)
);

const renderAccountValue = ({ identifierValue }) => {
  return (
    <div>
      <div>
        <span className={styles.key}>Home Page: </span>
        <span className={styles.value}>{identifierValue.get('homePage')}</span>
      </div>
      <div>
        <span className={styles.key}>Name: </span>
        <span className={styles.value}>{identifierValue.get('name')}</span>
      </div>
    </div>
  );
};

const renderSavedIdentifier = ({ model, deleteModel }) => {
  const identifierType = model.getIn(['ifi', 'key']);
  const identifierValue = model.getIn(['ifi', 'value']);
  return (
    <tr>
      <td className={styles.td}>
        {identifierType}
      </td>
      <td className={styles.td}>
        {identifierType !== 'account'
          ? identifierValue
          : renderAccountValue({ identifierValue })
        }
      </td>
      <td className={classNames(styles.td, styles.actions)}>
        <DeleteIconButton onConfirm={deleteModel} target="identifier" />
      </td>
    </tr>
  );
};

export default enhanceSavedIdentifier(renderSavedIdentifier);