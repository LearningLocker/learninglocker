import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import DebounceInput from 'react-debounce-input';
import { Map } from 'immutable';
import {
  compose,
  withHandlers,
} from 'recompose';
import styles from './styles.css';

const defaultInputComponent = ({
  value,
  onChange
}) =>
  (
    <DebounceInput
      className="form-control"
      debounceTimeout={377}
      value={value}
      onChange={onChange} />
  );

const withHandlersEnhance = withHandlers(
  {
    onKeyChange: ({ values, onChange }) => key => (element) => {
      const newKey = element.target.value;

      const newValues = values.mapKeys(k =>
        ((k === key) ? newKey : k)
      );

      onChange(newValues);
    },
    onValueChange: props => key => (element) => {
      if (props.onValueChange) {
        return props.onValueChange(props)(key)(element);
      }

      const { values, onChange } = props;

      let newValue = element;
      if (element.target) {
        newValue = element.target.value;
      }

      onChange(
        values.set(key, newValue)
      );
    },
    remove: ({ values, onChange }) => key => () => {
      onChange(
        values.delete(key)
      );
    },
    add: ({ values, onChange }) => () => {
      onChange(
        values.set('New', '')
      );
    }
  }
);

/**
 * @param {object} { staticValues: immutable.Map }
 * @returns {immutable.Seq}
 */
const renderStaticValueHeaders = ({
  staticValues,
}) => staticValues.mapEntries(([value, key], index) => [index, (
  <tr key={`static-value-header-${index}`} >
    <td>
      <input
        className="form-control"
        type="text"
        value={key}
        disabled />
    </td>
    <td>
      <input
        className="form-control"
        type="text"
        value={value}
        disabled />
    </td>
  </tr>
)]).valueSeq();

/**
 * @param {object} {
 *   values: immutable.Map
 *   onKeyChange: (key: string) => (event) => void
 *   onValueChange: (key: string) => (event) => void
 *   inputComponent: ({ key: string, onChange: function, value: string }) => any,
 *   remove: (key: string) => (event) => void
 * }
 * @returns {immutable.Seq}
 */
const renderCustomHeaders = ({
  values,
  onKeyChange,
  onValueChange,
  inputComponent = defaultInputComponent,
  remove
}) => values
  .filter((_, k) => k !== '_id')
  .mapEntries(([key, value], index) => [index, (
    <tr key={`custom-header-${index}`}>
      <td>
        <DebounceInput
          className="form-control"
          debounceTimeout={377}
          value={key}
          onChange={onKeyChange(key)} />
      </td>
      <td>
        {inputComponent({
          key,
          onChange: onValueChange(key),
          value,
        })}
      </td>
      <td className={styles.textRight}>
        <a onClick={remove(key)} className="pull-right">
          <i className="icon ion-close" />
        </a>
      </td>
    </tr>
)]).valueSeq();

const TableInput = ({
  keyName = 'Column',
  valueName = 'Source',
  staticValues = new Map(),
  values, // key value object
  onChange,
  remove,
  inputComponent,
  add,
  onKeyChange,
  onValueChange,
}) => (
  <span>
    <table className={`table table-borderless ${styles.table}`}>
      <thead>
        <tr>
          <th>{keyName}</th>
          <th>{valueName}</th>
          <th />
        </tr>
      </thead>

      <tbody id="models">
        {renderStaticValueHeaders({ staticValues })}
        {renderCustomHeaders({
          values,
          onChange,
          onKeyChange,
          onValueChange,
          remove,
          inputComponent,
        })}
      </tbody>
    </table>

    <a className="btn btn-sm btn-inverse" style={{ width: '33px' }} onClick={add}>
      <i className="icon ion-plus" />
    </a>
  </span>
);

export default compose(
  withStyles(styles),
  // withPropsOnChangeEnhance,
  withHandlersEnhance,
)(TableInput);
