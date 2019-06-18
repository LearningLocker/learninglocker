import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, setPropTypes, withState } from 'recompose';
import AddIconButton from 'ui/components/IconButton/AddIconButton';
import CancelIconButton from 'ui/components/IconButton/CancelIconButton';
import Input from 'ui/components/Input/Input';
import TypedInput from 'ui/components/Input/TypedInput';
import styles from './styles.css';

const enhance = compose(
  setPropTypes({
    onAdd: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  }),
  withState('attributeKey', 'setAttributeKey', ''),
  withState('attributeValue', 'setAttributeValue', ''),
  withStyles(styles)
);

const render = ({
  attributeKey,
  attributeValue,
  setAttributeKey,
  setAttributeValue,
  onAdd,
  onCancel,
}) => {
  let keyRef = null;
  const handleAdd = () => {
    keyRef.focus();
    onAdd(attributeKey, attributeValue);
    setAttributeKey('');
    setAttributeValue('');
  };
  return (
    <tr>
      <td className={styles.td}>
        <Input
          value={attributeKey}
          placeholder="Attribute Name"
          onChange={setAttributeKey}
          onSubmit={handleAdd}
          inputRef={(input) => {
            keyRef = input;
          }} />
      </td>
      <td className={styles.td}>
        <TypedInput
          value={attributeValue}
          placeholder="Attribute Value"
          onChange={setAttributeValue}
          onSubmit={handleAdd} />
      </td>
      <td className={classNames(styles.td, styles.actions)}>
        <AddIconButton onClick={handleAdd} />
        <CancelIconButton onClick={onCancel} />
      </td>
    </tr>
  );
};

export default enhance(render);
