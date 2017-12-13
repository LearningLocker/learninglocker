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
    const updated = values.setIn([key], `$${value}`);
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
    const { projection, onChange, setReviver, rawMode } = this.props;

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
            inputComponent={this.renderInputComponent} />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(ProjectionInput);
