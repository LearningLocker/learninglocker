import React, { PropTypes, Component } from 'react';
import Link from 'ui/containers/Link';
import { Map } from 'immutable';

export default class OrganisationLink extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    style: PropTypes.object,
  }

  static defaultProps = {
    model: new Map(),
    style: {}
  }

  render = () => {
    const { model, style } = this.props;
    return (
      <Link
        style={style}
        routeName="admin.organisations.id"
        routeParams={{ organisationId: model.get('_id') }}>
        { model.get('name') }
      </Link>
    );
  }
}
