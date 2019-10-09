import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { withProps, compose } from 'recompose';
import { addModel } from 'ui/redux/modules/models';
import { queryStringToQuery, modelQueryStringSelector } from 'ui/redux/modules/search';
import { routeNodeSelector } from 'redux-router5';
import { loggedInUserId, currentScopesSelector } from 'ui/redux/modules/auth';
import SearchBox from 'ui/containers/SearchBox';
import ModelList from 'ui/containers/ModelList';
import SubOrgForm from 'ui/containers/SubOrgForm';
import { withModels } from 'ui/utils/hocs';
import canCreateOrganisationsFn from 'lib/services/auth/canCreateOrganisations';
import { getAppDataSelector } from 'ui/redux/modules/app';

const schema = 'organisation';
const OrgList = compose(
  withProps({
    schema,
    sort: fromJS({ createdAt: -1, _id: -1 })
  }),
  withModels
)(ModelList);

class SettingsOrganisationsPage extends Component {
  static propTypes = {
    userId: PropTypes.string,
    organisationId: PropTypes.string,
    addModel: PropTypes.func,
    searchString: PropTypes.string
  };

  onClickAdd = () => {
    this.addButton.blur();
    this.props.addModel({
      schema: 'organisation',
      props: {
        parent: this.props.organisationId,
        owner: this.props.userId,
        isExpanded: true
      }
    });
  }

  render = () => {
    const activeScopesJs = this.props.activeScopes.toJS();

    const canCreateOrg = canCreateOrganisationsFn(activeScopesJs, {
      RESTRICT_CREATE_ORGANISATION: this.props.RESTRICT_CREATE_ORGANISATION
    });

    return (
      <div>
        <header id="topbar">
          <div className="heading heading-light">
            {canCreateOrg && <span className="pull-right open_panel_btn">
              <button className="btn btn-primary btn-sm" ref={(ref) => { this.addButton = ref; }} onClick={this.onClickAdd}>
                <i className="ion ion-plus" /> Add new
              </button>
            </span>}
            <span className="pull-right open_panel_btn" style={{ width: '25%' }}>
              <SearchBox schema={schema} />
            </span>
            Organisations
          </div>
        </header>
        <div className="row">
          <div className="col-md-12">
            <OrgList
              filter={queryStringToQuery(this.props.searchString, schema)}
              getDescription={model => model.get('name')}
              ModelForm={SubOrgForm} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  const userId = loggedInUserId(state);
  const params = routeNodeSelector('organisation.settings.suborgs')(state).route.params;
  return {
    organisationId: params.organisationId,
    userId,
    searchString: modelQueryStringSelector(schema)(state),
    activeScopes: currentScopesSelector(state),
    RESTRICT_CREATE_ORGANISATION: getAppDataSelector('RESTRICT_CREATE_ORGANISATION')(state)
  };
}, { addModel })(SettingsOrganisationsPage);
