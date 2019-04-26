import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import CacheKeysAutoComplete from 'ui/containers/CacheKeysAutoComplete';
import { GROUP_OPTS } from 'ui/utils/visualisations/localOptions';

export default class GroupEditor extends Component {
  static propTypes = {
    group: PropTypes.instanceOf(Map),
    changeGroup: PropTypes.func.isRequired,
  }

  static defaultProps = {
    group: GROUP_OPTS.get('hour'),
  }

  componentDidMount = () => {
    this.props.changeGroup(this.props.group);
  }

  render = () => (
    <div>
      <CacheKeysAutoComplete
        selectedOption={this.props.group}
        localOptions={GROUP_OPTS}
        onSelectOption={this.props.changeGroup}
        useTooltip="true" />
    </div>
  )
}
