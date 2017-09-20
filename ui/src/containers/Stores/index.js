import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withProps, compose } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import { fromJS } from 'immutable';
import { queryStringToQuery, modelQueryStringSelector } from 'ui/redux/modules/search';
import { addModel } from 'ui/redux/modules/models';
import { loggedInUserId } from 'ui/redux/modules/auth';
import { clearModelsCache } from 'ui/redux/modules/pagination';
import SearchBox from 'ui/containers/SearchBox';
import ModelList from 'ui/containers/ModelList';
import LrsForm from 'ui/containers/LrsForm';

const schema = 'lrs';
const StoreList = compose(
  withProps({
    schema,
    sort: fromJS({ createdAt: -1, _id: -1 })
  }),
  withModels
)(ModelList);

class Stores extends Component {
  static propTypes = {
    userId: PropTypes.string,
    addModel: PropTypes.func,
    searchString: PropTypes.string,
  };

  state = {
    criteria: ''
  }

  onClickAdd = () => {
    this.addButton.blur();
    return this.props.addModel({
      schema,
      props: {
        owner: this.props.userId,
        isExpanded: true
      }
    })
    .then(() => {
      // when we add a new store we also create a new client
      this.props.clearModelsCache({ schema: 'client' });
    })
    .catch((err) => { console.error(err); });
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
          Learning Record Stores
        </div>
      </header>
      <div className="row">
        <div className="col-md-12">
          <StoreList
            filter={queryStringToQuery(this.props.searchString, schema)}
            getDescription={model => `${model.get('title', '')} ( ${model.get('statementCount')} )`}
            ModelForm={LrsForm} />
        </div>
      </div>
    </div>
  )

}

export default connect(state => ({
  userId: loggedInUserId(state),
  searchString: modelQueryStringSelector(schema)(state),
}), { addModel, clearModelsCache })(Stores);
