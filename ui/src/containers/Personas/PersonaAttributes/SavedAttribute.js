import React, { PropTypes } from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import EditIconButton from 'ui/components/IconButton/EditIconButton';
import DeleteIconButton from 'ui/components/IconButton/DeleteIconButton';
import styles from './styles.css';

const enhanceChangingAttribute = compose(
  withProps({ schema: 'personaAttribute' }),
  withModel,
  withStyles(styles)
);

const renderSavedAttribute = ({ model, setMetadata, deleteModel }) => {
  return (
    <tr>
      <td className={styles.td}>
        {model.get('key', '')}
      </td>
      <td className={styles.td}>
        {model.get('value', '')}
      </td>
      <td className={classNames(styles.td, styles.actions)}>
        <EditIconButton onClick={() => {
          setMetadata('isChanging', true)
        }} />
        <DeleteIconButton onConfirm={deleteModel} target="attribute" />
      </td>
    </tr>
  );
};

export default enhanceChangingAttribute(renderSavedAttribute);