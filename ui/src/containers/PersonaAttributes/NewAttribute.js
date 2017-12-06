import React, { PropTypes } from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, setPropTypes, withState } from 'recompose';
import AddIconButton from 'ui/components/IconButton/AddIconButton';
import CancelIconButton from 'ui/components/IconButton/CancelIconButton';
import styles from './styles.css';

const enhanceNewAttribute = compose(
  setPropTypes({
    onAdd: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  }),
  withState('attributeKey', 'setAttributeKey', ''),
  withState('attributeValue', 'setAttributeValue', ''),
  withStyles(styles)
);

const renderNewAttribute = ({
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
  const handleEnterSave = (e) => {
    if (e.keyCode === 13) {
      handleAdd();
    }
  };
  return (
    <tr>
      <td className={styles.td}>
        <input
          value={attributeKey}
          onChange={(e) => setAttributeKey(e.target.value)}
          placeholder="Attribute Name"
          className={classNames(styles.input, 'form-control')}
          onKeyDown={handleEnterSave}
          ref={(input) => {
            keyRef = input;
          }} />
      </td>
      <td className={styles.td}>
        <input
          value={attributeValue}
          onChange={(e) => setAttributeValue(e.target.value)}
          onKeyDown={handleEnterSave}
          placeholder="Attribute Value"
          className={classNames(styles.input, 'form-control')} />
      </td>
      <td className={classNames(styles.td, styles.actions)}>
        <AddIconButton onClick={handleAdd} />
        <CancelIconButton onClick={onCancel} />
      </td>
    </tr>
  );
};

export default enhanceNewAttribute(renderNewAttribute);