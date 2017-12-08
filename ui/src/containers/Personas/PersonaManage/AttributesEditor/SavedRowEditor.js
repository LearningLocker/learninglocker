import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Map } from 'immutable';
import DebounceInput from 'react-debounce-input';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withState, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import SaveIconButton from 'ui/components/IconButton/SaveIconButton';
import CancelIconButton from 'ui/components/IconButton/CancelIconButton';
import Input from 'ui/components/Input/Input';
import styles from '../styles.css';

const enhance = compose(
  withProps({ schema: 'personaAttribute' }),
  withModel,
  withState('attributeValue', 'setAttributeValue', ({ model }) => {
    return model.get('value', '');
  }),
  withStyles(styles)
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
      <td className={styles.td}>{key}</td>
      <td className={styles.td}>
        <Input
          value={attributeValue}
          placeholder="value"
          onChange={setAttributeValue}
          onSubmit={handleSave} />
      </td>
      <td className={classNames(styles.td, styles.actions)}>
        <SaveIconButton onClick={handleSave} />
        <CancelIconButton onClick={handleCancelEdit} />
      </td>
    </tr>
  );
};

export default enhance(render);