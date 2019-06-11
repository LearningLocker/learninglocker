import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, setPropTypes, withState } from 'recompose';
import AddIconButton from 'ui/components/IconButton/AddIconButton';
import CancelIconButton from 'ui/components/IconButton/CancelIconButton';
import TypeEditor from './TypeEditor';
import IfiEditor from '../IfiEditor';
import hasIdentifierValueErrors from './hasIdentifierValueErrors';
import styles from './styles.css';

const enhance = compose(
  setPropTypes({
    onAdd: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  }),
  withState('identifierType', 'setIdentifierType', 'mbox'),
  withState('identifierValue', 'setIdentifierValue', ''),
  withStyles(styles),
);

const render = ({
  identifierValue,
  identifierType,
  setIdentifierValue,
  setIdentifierType,
  onAdd,
  onCancel,
}) => {
  let firstInputRef = null;
  const hasErrors = hasIdentifierValueErrors(identifierType, identifierValue);
  const handleTypeChange = (type) => {
    if (type === 'account') {
      setIdentifierValue(new Map({
        homePage: '',
        name: identifierValue,
      }));
    } else if (identifierType === 'account') {
      setIdentifierValue(identifierValue.get('name'));
    }
    setIdentifierType(type);
    firstInputRef.focus();
  };
  const handleAdd = () => {
    if (hasErrors) return;
    onAdd(identifierType, identifierValue);
    if (identifierType === 'account') {
      setIdentifierValue(new Map({
        homePage: '',
        name: '',
      }));
    } else {
      setIdentifierValue('');
    }
  };
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
            firstInputRef = input;
          }} />
      </td>
      <td className={classNames(styles.td, styles.actions)}>
        <AddIconButton onClick={handleAddAndReset} disabled={hasErrors} />
        <CancelIconButton onClick={onCancel} />
      </td>
    </tr>
  );
};

export default enhance(render);
