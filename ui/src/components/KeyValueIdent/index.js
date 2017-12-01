/* eslint-disable react/jsx-indent */
import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import DeleteButton from 'ui/containers/DeleteButton';
import EditButton from 'ui/components/KeyValueIdent/EditButton';
import {
  compose,
  withHandlers,
  withState
} from 'recompose';
import { withModel } from 'ui/utils/hocs';
import PersonaAttributeForm from 'ui/components/PersonaAttributeForm';

const editState = withState('isEdit', 'setIsEdit', false);

const handlers = withHandlers({
  onEdit: ({
    isEdit,
    setIsEdit
  }) => () => {
    setIsEdit(!isEdit);
  },
  onCancel: ({ setIsEdit }) => () => {
    setIsEdit(false);
  },
  onSubmit: ({
    saveModel,
    model,
    path = [],
    setIsEdit
  }) => ({ value }) => {
    const newModel = model.setIn([...path, 'value'], value);

    saveModel({
      attrs: newModel
    });

    setIsEdit(false);
  }
});

const KeyValueIdent = ({
  ident,
  id,
  schema,
  onEdit,
  isEdit,
  onSubmit,
  onCancel
}) => {
  const value = ident.get('value');

  const renderedValue =
    typeof value === 'string' ? (
      <code>{value}</code>
    ) : (
      <pre>{JSON.stringify(value, null, 2)}</pre>
    );

  return (
    <div>
    {!isEdit && <dl className="dl-horizontal clearfix">
      <dt>{ident.get('key')}</dt>
      <dd>
        {renderedValue}
        <DeleteButton schema={schema} id={id} className="pull-right" small />
        <EditButton onEdit={onEdit} id={id} className="btn btn-primary pull-right" />
      </dd>
    </dl>}
    {isEdit &&
      <PersonaAttributeForm
        attribute={ident}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isEdit="true" />
    }
    </div>
  );
};

KeyValueIdent.propTypes = {
  ident: PropTypes.instanceOf(Map)
};

export default compose(
  withModel,
  editState,
  handlers
)(KeyValueIdent);
