import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import SearchBox from 'ui/containers/SearchBox';
import { withProps, compose } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import { addModel } from 'ui/redux/modules/models';
import ModelList from 'ui/containers/ModelList';
import { loggedInUserId } from 'ui/redux/modules/auth';
import { queryStringToQuery, modelQueryStringSelector } from 'ui/redux/modules/search';
import PrivacyToggleButton from 'ui/containers/PrivacyToggleButton';
import DeleteButton from 'ui/containers/DeleteButton';
import StatementForwardingForm from './StatementForwardingForm';

const schema = 'statementForwarding';

const StatementForwardingList = compose(
  withProps({
    schema,
    sort: fromJS({ createdAt: -1, _id: -1 })
  }),
  withModels
)(ModelList);

class StatementForwarding extends Component {
  static propTypes = {
    userId: PropTypes.string,
    addModel: PropTypes.func,
    searchString: PropTypes.string,
  };

  onClickAdd = () => {
    this.addButton.blur();
    this.props.addModel({
      schema,
      props: {
        owner: this.props.userId,
        isExpanded: true
      }
    });
  }

  render = () => (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
          <span className="pull-right open_panel_btn">
            <button
              className="btn btn-primary btn-sm"
              ref={(ref) => { this.addButton = ref; }}
              onClick={this.onClickAdd}>
              <i className="ion ion-plus" /> Add new
            </button>
          </span>
          <span className="pull-right open_panel_btn" style={{ width: '25%' }}>
            <SearchBox schema={schema} />
          </span>
          Statement Forwarding
        </div>
      </header>
      <div className="row">
        <div className="col-md-12">
          <StatementForwardingList
            buttons={[PrivacyToggleButton, DeleteButton]}
            filter={queryStringToQuery(this.props.searchString, schema)}
            ModelForm={StatementForwardingForm}
            getDescription={model => model.get('description', '~ Unnamed Statement Forwarding')} />
        </div>
      </div>
    </div>
  )
}

export default connect(state => ({
  userId: loggedInUserId(state),
  searchString: modelQueryStringSelector(schema)(state)
}), { addModel })(StatementForwarding);
