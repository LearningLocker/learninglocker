import React from 'react';
import { Map } from 'immutable';
import { compose, withState, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import SaveIconButton from 'ui/components/IconButton/SaveIconButton';
import CancelIconButton from 'ui/components/IconButton/CancelIconButton';
import TypedInput from 'ui/components/Input/TypedInput';
import { TableActionsData, TableData } from './tableComponents';

const enhance = compose(
  withProps({ schema: 'personaAttribute' }),
  withModel,
  withState('attributeValue', 'setAttributeValue', ({ model }) => model.get('value', ''))
);

const render = ({
  model,
  setMetadata,
  attributeValue,
  setAttributeValue,
  saveModel,
}) => {
  const key = model.get('key', '');
  const handleSave = () => {
    saveModel({ attrs: new Map({ value: attributeValue }) });
    setMetadata('isChanging', false);
  };
  const handleCancelEdit = () => {
    setMetadata('isChanging', false);
  };
  return (
    <tr>
      <TableData>{key}</TableData>
      <TableData>
        <TypedInput
          value={attributeValue}
          placeholder="value"
          onChange={setAttributeValue}
          onSubmit={handleSave} />
      </TableData>
      <TableActionsData>
        <SaveIconButton onClick={handleSave} />
        <CancelIconButton onClick={handleCancelEdit} />
      </TableActionsData>
    </tr>
  );
};

export default enhance(render);
