import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, setPropTypes, withState, withHandlers } from 'recompose';
import AddIconButton from 'ui/components/IconButton/AddIconButton';
import CancelIconButton from 'ui/components/IconButton/CancelIconButton';
import styles from './styles.css';
import TypeEditor from './TypeEditor';
import IfiEditor from './IfiEditor';

const enhanceNewIdentifier = compose(
  setPropTypes({
    onAdd: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  }),
  withState('identifierType', 'setIdentifierType', 'mbox'),
  withState('identifierValue', 'setIdentifierValue', ''),
  withHandlers({
    handleAdd: ({
      onAdd,
      identifierType,
      identifierValue,
      setIdentifierValue,
    }) => () => {
        onAdd(identifierType, identifierValue);
        if (identifierType === 'account') {
          setIdentifierValue(new Map({
            homePage: '',
            name: '',
          }));
        } else {
          setIdentifierValue('');
        }
      },
    handleTypeChange: ({
      identifierType,
      identifierValue,
      setIdentifierType,
      setIdentifierValue,
    }) => (type) => {
        if (type === 'account') {
          setIdentifierValue(new Map({
            homePage: '',
            name: identifierValue,
          }));
        } else if (identifierType === 'account') {
          setIdentifierValue(identifierValue.get('name'));
        }
        setIdentifierType(type);
      },
  }),
  withStyles(styles),
);

const renderNewIdentifier = ({
  identifierType,
  identifierValue,
  handleTypeChange,
  setIdentifierValue,
  handleAdd,
  onCancel,
}) => {
  let firstInputRef = null;
  const handleAddAndReset = () => {
    firstInputRef.focus();
    handleAdd();
  };
  return (
    <tr>
      <td className={styles.td}>
        <TypeEditor value={identifierType} onChange={handleTypeChange} />
      </td>
      <td className={styles.td}>
        <IfiEditor
          identifierType={identifierType}
          value={identifierValue}
          onChange={setIdentifierValue}
          onSave={handleAddAndReset}
          refFirstInput={(input) => {
            firstInputRef = input
          }} />
      </td>
      <td className={classNames(styles.td, styles.actions)}>
        <AddIconButton onClick={handleAddAndReset} />
        <CancelIconButton onClick={onCancel} />
      </td>
    </tr>
  );
};

export default enhanceNewIdentifier(renderNewIdentifier);