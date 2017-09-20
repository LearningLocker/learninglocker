import React, { Component, PropTypes } from 'react';
import { displayActor } from 'ui/utils/xapi';
import { Map } from 'immutable';

export default class OwnerCell extends Component {
  static propTypes = {
    journeyProgress: PropTypes.instanceOf(Map),
  }

  static defaultProps = {
    journeyProgress: new Map()
  }

  renderOwner = (owner) => {
    const trackBy = owner.get('trackBy');
    const ident = owner.get('ident');
    if (trackBy === 'actor') {
      const display = displayActor(ident);
      return (
        <span title={display}>{display}</span>
      );
    }
    return 'No name found';
  }

  render() {
    const { journeyProgress, ...props } = this.props;
    const owner = journeyProgress.get('owner');
    if (!owner) return <div {...props}> Loading... </div>;

    return (
      <div {...props}>
        { this.renderOwner(owner) }
      </div>
    );
  }
}
