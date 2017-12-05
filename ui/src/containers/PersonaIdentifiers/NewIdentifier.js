import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, setPropTypes, withState, withHandlers } from 'recompose';
import SaveIconButton from 'ui/components/IconButton/SaveIconButton';
import DeleteIconButton from 'ui/components/IconButton/DeleteIconButton';
import styles from './styles.css';
import TypeEditor from './TypeEditor';
import IfiEditor from './IfiEditor';

const enhanceNewIdentifier = compose(
  setPropTypes({
    onAdd: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  }),
  withState('identifierType', 'setIdentifierType', 'mbox'),
  withState('identifierValue', 'setIdentifierValue', ''),
  withHandlers({
    handleSave: ({
      onAdd,
      identifierType,
      identifierValue,
      setIdentifierValue,
    }) => () => {
        onAdd(identifierType, identifierValue);
        if (identifierType === 'account') {
          setIdentifierValue(new Map({
            homePage: identifierValue.get('homePage'),
            name: '',
          }));
        } else {
          setIdentifierValue('');
        }
      },
    handleTypeChange: ({
      identifierType,
      identifierValue,
      setIdentifierType,
      setIdentifierValue,
    }) => (type) => {
        if (type === 'account') {
          setIdentifierValue(new Map({
            homePage: '',
            name: identifierValue,
          }));
        } else if (identifierType === 'account') {
          setIdentifierValue(identifierValue.get('name'));
        }
        setIdentifierType(type);
      },
  }),
  withStyles(styles),
);

const renderNewIdentifier = ({
  identifierType,
  identifierValue,
  handleTypeChange,
  setIdentifierValue,
  handleSave,
  onCancel,
}) => {
  return (
    <tr>
      <td className={styles.td}>
        <TypeEditor value={identifierType} onChange={handleTypeChange} />
      </td>
      <td className={styles.td}>
        <IfiEditor identifierType={identifierType} value={identifierValue} onChange={setIdentifierValue} />
      </td>
      <td className={classNames(styles.td, styles.actions)}>
        <SaveIconButton onClick={handleSave} />
        <DeleteIconButton onClick={onCancel} />
      </td>
    </tr>
  );
};

export default enhanceNewIdentifier(renderNewIdentifier);