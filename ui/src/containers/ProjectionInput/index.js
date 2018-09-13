/* eslint-disable react/jsx-indent */
import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Map } from 'immutable';
import JsonTextArea from 'ui/components/JsonTextArea';
import toString from 'lodash/toString';
import TableInput from 'ui/components/TableInput';
import styles from './projectionbuilder.css';
import CacheKeysAutoComplete from './CacheKeysAutoComplete';

const stripDollar = string => string.replace(/^(\$)/, '');

class ProjectionInput extends Component {
  static propTypes = {
    projection: PropTypes.instanceOf(Map),
    setReviver: PropTypes.func,
    onChange: PropTypes.func,
    rawMode: PropTypes.bool,
  }

  static defaultProps = {
    projection: new Map()
  }

  onEditFieldVal = ({
    onChange,
    values,
  }) => key => (value) => {
    const addDefaultKey = (oldKey) => {
      const defaultTitle = oldValue => (oldValue.split('.').map(word => word.charAt(0).toUpperCase() + word.substr(1))).join(' ');
      if (oldKey === 'Unnamed' || oldKey === '') {
        // find unnamed key in the map and replace with the default value
        const newMap = values.mapKeys((k) => {
          if (k === oldKey) {
            return defaultTitle(value);
          }
          return k;
        });
        // return the new map and set the new keys value
        return newMap.setIn([defaultTitle(value) || value], `$${value}`);
      }
      // if the value is changed and previously the title was default make a new default title
      if (oldKey === defaultTitle(oldKey)) {
        const newMap = values.mapKeys((k) => {
          if (k === oldKey) {
            return defaultTitle(value);
          }
          return k;
        });
        return newMap.setIn([defaultTitle(value)], `$${value}`);
      }
      // if the key has been named then return the human named key with the new value
      return values.setIn([oldKey], `$${value}`);
    };

    const updated = addDefaultKey(key);
    onChange(updated);
  }

  onChange = (values) => {
    this.props.onChange(values);
  }

  optionToString = (option = new Map()) => option.get('searchString')

  renderInputComponent = ({
    value,
    onChange
  }) =>
    (<CacheKeysAutoComplete
      value={stripDollar(toString(value))}
      onEditFieldVal={onChange}
      onChange={onChange}
      onSelectOption={onChange} />);

  render = () => {
    const { projection, onChange, setReviver, rawMode, isStatementVisualisation } = this.props;

    return (
      <div style={{ marginTop: '10px' }} >
        { rawMode ? (
          <span>
            <JsonTextArea value={projection} onChange={onChange} setReviver={setReviver} />
          </span>
        ) : (
          <TableInput
            values={projection}
            onChange={this.onChange}
            onValueChange={this.onEditFieldVal}
            isStatementVisualisation={isStatementVisualisation}
            inputComponent={this.renderInputComponent} />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(ProjectionInput);
