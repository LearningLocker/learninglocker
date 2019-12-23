import React from 'react';
import PropTypes from 'prop-types';
import { compose, setPropTypes, withState } from 'recompose';
import AddIconButton from 'ui/components/IconButton/AddIconButton';
import CancelIconButton from 'ui/components/IconButton/CancelIconButton';
import Input from 'ui/components/Input/Input';
import TypedInput from 'ui/components/Input/TypedInput';
import { TableActionsData, TableData } from './tableComponents';

const enhance = compose(
  setPropTypes({
    onAdd: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  }),
  withState('attributeKey', 'setAttributeKey', ''),
  withState('attributeValue', 'setAttributeValue', '')
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
      <TableData>
        <Input
          value={attributeKey}
          placeholder="Attribute Name"
          onChange={setAttributeKey}
          onSubmit={handleAdd}
          inputRef={(input) => {
            keyRef = input;
          }} />
      </TableData>
      <TableData>
        <TypedInput
          value={attributeValue}
          placeholder="Attribute Value"
          onChange={setAttributeValue}
          onSubmit={handleAdd} />
      </TableData>
      <TableActionsData>
        <AddIconButton onClick={handleAdd} disabled={!(attributeKey.length && attributeValue.length)} />
        <CancelIconButton onClick={onCancel} />
      </TableActionsData>
    </tr>
  );
};

export default enhance(render);
