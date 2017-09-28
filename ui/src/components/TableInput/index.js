import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { map } from 'lodash';
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

const renderItems = ({
  staticValues,
  values,
  onKeyChange,
  onValueChange,
  inputComponent = defaultInputComponent,
  remove
}) => {
  const valuesJs = values.toJS();

  const staticValuesRendered = map(staticValues.toJS(), (value, key) =>
    (<tr>
      <td>
        <input className="form-control" type="text" value={key} disabled="true" />
      </td>
      <td>
        <input className="form-control" type="text" value={value} disabled="true" />
      </td>
    </tr>)
  );

  let trKey = 0;
  const valuesRendered = map(valuesJs, (value, key) => {
    if (key === '_id') {
      return null;
    }

    trKey += 1;

    return (<tr key={trKey}>
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
    </tr>);
  });
  return [staticValuesRendered, valuesRendered];
};

const render = ({
  keyName = 'Column',
  valueName = 'Source',
  staticValues = new Map(), // can't be changed
  values, // key value object
  onChange,
  remove,
  inputComponent,
  add,
  onKeyChange,
  onValueChange,
}) => {
  const items = renderItems({
    staticValues,
    values,
    onChange,
    onKeyChange,
    onValueChange,
    remove,
    inputComponent
  });

  return (<span>
    <table className={`table table-borderless ${styles.table}`}>
      <thead>
        <tr>
          <th>{keyName}</th>
          <th>{valueName}</th>
          <th />
        </tr>
      </thead>
      <tbody id="models">{items}</tbody>
    </table>
    <a className="btn btn-sm btn-inverse" style={{ width: '33px' }} onClick={add}>
      <i className="icon ion-plus" />
    </a>
  </span>);
};

export default compose(
  withStyles(styles),
  // withPropsOnChangeEnhance,
  withHandlersEnhance,
)(render);
