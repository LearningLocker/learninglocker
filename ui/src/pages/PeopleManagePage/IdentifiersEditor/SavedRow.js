import React from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import IconButton from 'ui/components/IconButton/IconButton';
import DeleteIconButton from 'ui/components/IconButton/DeleteIconButton';
import IfiViewer from '../IfiViewer';
import { identifierTypeDisplays } from '../constants';
import ReassignmentForm from './ReassignmentForm';
import styles from './styles.css';

const enhance = compose(
  withProps({ schema: 'personaIdentifier' }),
  withModel,
  withStyles(styles)
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
      <td className={styles.td}>
        {identifierTypeDisplays[identifierType]}
      </td>
      <td className={styles.td}>
        <IfiViewer identifierType={identifierType} identifierValue={identifierValue} />
      </td>
      <td className={classNames(styles.td, styles.actions)}>
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
      </td>
    </tr>
  );
};

export default enhance(render);
