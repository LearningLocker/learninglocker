import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { compose, setPropTypes, withState } from 'recompose';
import AddIconButton from 'ui/components/IconButton/AddIconButton';
import CancelIconButton from 'ui/components/IconButton/CancelIconButton';
import IfiEditor from '../IfiEditor';
import TypeEditor from './TypeEditor';
import hasIdentifierValueErrors from './hasIdentifierValueErrors';
import { TableData, ActionsTableData } from './TableData';

const enhance = compose(
  setPropTypes({
    onAdd: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  }),
  withState('identifierType', 'setIdentifierType', 'mbox'),
  withState('identifierValue', 'setIdentifierValue', '')
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
      <TableData>
        <TypeEditor value={identifierType} onChange={handleTypeChange} />
      </TableData>
      <TableData>
        <IfiEditor
          identifierType={identifierType}
          value={identifierValue}
          onChange={setIdentifierValue}
          onSave={handleAddAndReset}
          refFirstInput={(input) => {
            firstInputRef = input;
          }} />
      </TableData>
      <ActionsTableData>
        <AddIconButton onClick={handleAddAndReset} disabled={hasErrors} />
        <CancelIconButton onClick={onCancel} />
      </ActionsTableData>
    </tr>
  );
};

export default enhance(render);
