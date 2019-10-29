import React from 'react';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import IconButton from 'ui/components/IconButton/IconButton';
import DeleteIconButton from 'ui/components/IconButton/DeleteIconButton';
import IfiViewer from '../IfiViewer';
import { identifierTypeDisplays } from '../constants';
import ReassignmentForm from './ReassignmentForm';
import { TableData, ActionsTableData } from './TableData';

const enhance = compose(
  withProps({ schema: 'personaIdentifier' }),
  withModel
);

const render = ({ model, deleteModel, getMetadata, setMetadata }) => {
  const id = model.get('_id');
  const identifierType = model.getIn(['ifi', 'key']);
  const identifierValue = model.getIn(['ifi', 'value']);
  const isReassignmentVisible = getMetadata('isReassignmentVisible', false);
  const handleShowReassignment = () => {
    setMetadata('isReassignmentVisible', true);
  };
  return (
    <tr>
      <TableData>
        {identifierTypeDisplays[identifierType]}
      </TableData>
      <TableData>
        <IfiViewer identifierType={identifierType} identifierValue={identifierValue} />
      </TableData>
      <ActionsTableData>
        {isReassignmentVisible
          ? <ReassignmentForm id={id} />
          : (
            <div>
              <IconButton
                title="Reassign identifier"
                icon="icon ion-person-stalker"
                onClick={handleShowReassignment} />
              <DeleteIconButton
                onConfirm={deleteModel}
                target="identifier" />
            </div>
          )
        }
      </ActionsTableData>
    </tr>
  );
};

export default enhance(render);
