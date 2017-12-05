import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Map } from 'immutable';
import DebounceInput from 'react-debounce-input';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withState, withProps, withHandlers } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import SaveIconButton from 'ui/components/IconButton/SaveIconButton';
import CancelIconButton from 'ui/components/IconButton/CancelIconButton';
import styles from './styles.css';
import IfiEditor from './IfiEditor';

const enhanceChangingAttribute = compose(
  withProps({ schema: 'personaIdentifier' }),
  withModel,
  withState('identifierValue', 'setIdentifierValue', ({ model }) => {
    return model.getIn(['ifi', 'value'], '');
  }),
  withStyles(styles),
  withHandlers({
    handleSave: ({ saveModel, setMetadata, model, identifierValue }) => () => {
      saveModel({ attrs: model.setIn(['ifi', 'value'], identifierValue) });
      setMetadata('isChanging', false);
    },
  })
);

const renderChangingAttribute = ({
  model,
  setMetadata,
  identifierValue,
  setIdentifierValue,
  handleSave,
}) => {
  return (
    <tr>
      <td className={styles.td}>
        {model.getIn(['ifi', 'key'])}
      </td>
      <td className={styles.td}>
        <IfiEditor
          identifierType={model.getIn(['ifi', 'key'])}
          value={identifierValue}
          onChange={setIdentifierValue} />
      </td>
      <td className={classNames(styles.td, styles.actions)}>
        <SaveIconButton onClick={handleSave} />
        <CancelIconButton onClick={() => {
          setMetadata('isChanging', false);
        }} />
      </td>
    </tr>
  );
};

export default enhanceChangingAttribute(renderChangingAttribute);