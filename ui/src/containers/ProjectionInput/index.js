/* eslint-disable react/jsx-indent */
import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Map } from 'immutable';
import DebounceInput from 'react-debounce-input';
import JsonTextArea from 'ui/components/JsonTextArea';
import map from 'lodash/map';
import toString from 'lodash/toString';
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

  onEditFieldVal = (key, value) => {
    const { projection } = this.props;
    const updated = projection.setIn([key], `$${value}`);
    this.props.onChange(updated);
  }

  onEditFieldTitle = (key, e) => {
    if (e) e.preventDefault();

    const { projection } = this.props;
    const updated = projection.mapKeys((k) => {
      if (k === key) return e.target.value;
      return k;
    });
    this.props.onChange(updated);
  }

  onAddField = () => {
    const { projection } = this.props;
    const addNew = {
      'New title': ''
    };
    const updated = projection.merge(addNew);
    this.props.onChange(updated);
  }

  onRemoveField = (key) => {
    const { projection } = this.props;
    const updated = projection.delete(key);
    this.props.onChange(updated);
  }

  optionToString = (option = new Map()) => option.get('searchString')

  renderItems = () => {
    const { projection } = this.props;
    const project = projection.toJS();
    let keyCount = 0;
    return map(project, (value, k) => {
      keyCount += 1;
      if (k === '_id') {
        return null;
      }
      return (
        <tr key={keyCount + 1}>
          <td>
            <DebounceInput
              className="form-control"
              debounceTimeout={377}
              value={k}
              onChange={this.onEditFieldTitle.bind(null, k)} />
          </td>
          <td>
            <CacheKeysAutoComplete
              value={stripDollar(toString(value))}
              onEditFieldVal={this.onEditFieldVal}
              onChange={val => this.onEditFieldVal(k, val)}
              onSelectOption={this.onEditFieldVal.bind(null, k)} />
          </td>
          <td className={styles.textRight} >
            <a onClick={this.onRemoveField.bind(null, k)} className="pull-right">
              <i className="icon ion-close" />
            </a>
          </td>
        </tr>
      );
    });
  }

  render = () => {
    const { projection, onChange, setReviver, rawMode } = this.props;
    const items = this.renderItems();

    return (
      <div style={{ marginTop: '10px' }} >
        { rawMode ? (
          <span>
            <JsonTextArea value={projection} onChange={onChange} setReviver={setReviver} />
          </span>
        ) : (
          <span>
            <table className={`table table-borderless ${styles.table}`}>
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Source</th>
                  <th />
                </tr>
              </thead>
              <tbody id="models">{items}</tbody>
            </table>
            <a className="btn btn-sm btn-inverse" style={{ width: '33px' }} onClick={this.onAddField}>
              <i className="icon ion-plus" />
            </a>
          </span>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(ProjectionInput);
