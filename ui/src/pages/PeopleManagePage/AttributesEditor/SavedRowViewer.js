import React from 'react';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import EditIconButton from 'ui/components/IconButton/EditIconButton';
import DeleteIconButton from 'ui/components/IconButton/DeleteIconButton';
import { TableActionsData, TableData } from './tableComponents';

const enhance = compose(
  withProps({ schema: 'personaAttribute' }),
  withModel
);

const render = ({ model, setMetadata, deleteModel }) => {
  const key = model.get('key', '');
  const value = model.get('value', '');
  const handleEdit = () => {
    setMetadata('isChanging', true);
  };
  return (
    <tr>
      <TableData>{key}</TableData>
      <TableData>{value}</TableData>
      <TableActionsData>
        <EditIconButton onClick={handleEdit} />
        <DeleteIconButton onConfirm={deleteModel} target="attribute" />
      </TableActionsData>
    </tr>
  );
};

export default enhance(render);
