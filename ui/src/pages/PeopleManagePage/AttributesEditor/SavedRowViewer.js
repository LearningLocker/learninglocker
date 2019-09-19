import React from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import EditIconButton from 'ui/components/IconButton/EditIconButton';
import DeleteIconButton from 'ui/components/IconButton/DeleteIconButton';
import styles from './styles.css';

const enhance = compose(
  withProps({ schema: 'personaAttribute' }),
  withModel,
  withStyles(styles)
);

const render = ({ model, setMetadata, deleteModel }) => {
  const key = model.get('key', '');
  const value = model.get('value', '');
  const handleEdit = () => {
    setMetadata('isChanging', true);
  };
  return (
    <tr>
      <td className={styles.td}>{key}</td>
      <td className={styles.td}>{value}</td>
      <td className={classNames(styles.td, styles.actions)}>
        <EditIconButton onClick={handleEdit} />
        <DeleteIconButton onConfirm={deleteModel} target="attribute" />
      </td>
    </tr>
  );
};

export default enhance(render);
