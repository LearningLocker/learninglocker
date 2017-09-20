import React, { Component, PropTypes } from 'react';
import { Set, Map } from 'immutable';
import { AutoComplete } from 'ui/components';

export default class ArrayInput extends Component {
  static propTypes = {
    section: PropTypes.instanceOf(Map),
    onChange: PropTypes.func
  }

  static defaultProps = {
    section: new Map(),
    query: new Map(),
    suggestions: new Set(),
    onChange: () => {}
  }

  render = () => {
    const { section } = this.props;
    const values = section.get('values'); // query.get(section.get('keyPath'), new Set()).toSet();
    const toDisplay = section.get('toDisplay');
    const toDisplayIdent = section.get('toDisplayIdent');
    const suggestions = section.get('suggestions', new Set());
    return (
      <AutoComplete
        values={values}
        options={suggestions}
        parseToken={toDisplay}
        parseOptionTooltip={toDisplayIdent}
        parseOption={toDisplay}
        onChange={this.props.onChange.bind(null, section.get('keyPath'))} />
    );
  }
}
