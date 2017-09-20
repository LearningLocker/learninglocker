import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withModel } from 'ui/utils/hocs';
import { compose, renameProp, withProps } from 'recompose';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import { Map } from 'immutable';
import OrgForm from '../OrgForm/OrgForm';

const enhance = compose(
  connect(state => ({
    organisationId: activeOrgIdSelector(state)
  }), {}),
  withProps(({ organisationId }) => ({
    id: organisationId,
    schema: 'organisation'
  })),
  withModel,
  renameProp('model', 'organisation')
);

class Organisation extends Component {
  static propTypes = {
    organisation: PropTypes.instanceOf(Map)
  };
  static defaultProps = {
    organisation: new Map()
  }

  render = () => (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
          Organisation settings
        </div>
      </header>

      <OrgForm model={this.props.organisation} />
    </div>
  )
}

export default enhance(Organisation);
