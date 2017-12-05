import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Map } from 'immutable';
import DebounceInput from 'react-debounce-input';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withState, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import SaveIconButton from 'ui/components/IconButton/SaveIconButton';
import CancelIconButton from 'ui/components/IconButton/CancelIconButton';
import styles from './styles.css';

const enhanceChangingAttribute = compose(
  withProps({ schema: 'personaAttribute' }),
  withModel,
  withState('attributeValue', 'setAttributeValue', ({ model }) => {
    return model.get('value', '');
  }),
  withStyles(styles)
);

const renderChangingAttribute = ({
  model,
  setMetadata,
  attributeValue,
  setAttributeValue,
  saveModel,
}) => {
  const handleSave = () => {
    saveModel({ attrs: new Map({ value: attributeValue }) });
    setMetadata('isChanging', false);
  };
  const handleEnterSave = (e) => {
    if (e.keyCode === 13) {
      handleSave();
    }
  };
  return (
    <tr>
      <td className={styles.td}>
        {model.get('key', '')}
      </td>
      <td className={styles.td}>
        <input
          value={attributeValue}
          onChange={(e) => setAttributeValue(e.target.value)}
          placeholder="value"
          onKeyDown={handleEnterSave}
          className={classNames(styles.input, 'form-control')} />
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