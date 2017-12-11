import React, { PropTypes } from 'react';
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

const render = ({ model }) => {
  const key = model.get('key', '');
  const value = model.get('value', '');
  return (
    <tr>
      <td className={styles.td}>{key}</td>
      <td className={styles.td}>{value}</td>
    </tr>
  );
};

export default enhance(render);