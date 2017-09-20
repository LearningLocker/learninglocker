import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { withProps, compose } from 'recompose';
import {
  queryStringToQuery,
  modelQueryStringSelector
} from 'ui/redux/modules/search';
import { withModels } from 'ui/utils/hocs';
import { addModel } from 'ui/redux/modules/models';
import { routeNodeSelector } from 'redux-router5';
import PersonaView from 'ui/containers/PersonaView';
import ModelList from 'ui/containers/ModelList';
import DeleteButton from 'ui/containers/DeleteButton';
import PeopleImport from 'ui/containers/PeopleImport';
import SearchBox from 'ui/containers/SearchBox';
import ToggleMergeButton from 'ui/containers/ToggleMergeButton';

const schema = 'persona';
const PersonaList = compose(
  withProps({
    schema,
    sort: fromJS({ createdAt: -1, _id: -1 })
  }),
  withModels
)(ModelList);

class PersonaManage extends Component {
  static propTypes = {
    organisationId: PropTypes.string,
    addModel: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      openModal: null,
      criteria: ''
    };
  }

  getOrganisationId = () => this.props.params.organisationId;

  openModal = () => {
    this.setState({
      openModal: true
    });
  };

  closeModal = () => {
    this.setState({
      openModal: null
    });
  };

  getPersonaName = person => person.get('name');

  onClickAdd = () => {
    this.addButton.blur();
    this.props.addModel({
      schema,
      props: {
        isExpanded: true,
        identifiers: [
          {
            key: 'xapi_name',
            values: ['New Persona']
          }
        ]
      }
    });
  };

  render = () => {
    const { openModal } = this.state;
    const organisationId = this.getOrganisationId();
    const popupProps = {
      organisationId,
      onClickClose: this.closeModal
    };

    return (
      <div>
        <header id="topbar">
          <div className="heading heading-light">
            <span className="pull-right open_panel_btn">
              <button
                className="btn btn-primary btn-sm"
                onClick={this.openModal.bind(null)}>
                <i className="ion ion-upload" /> Import people
              </button>
            </span>
            <span className="pull-right open_panel_btn">
              <button
                className="btn btn-primary btn-sm"
                ref={(ref) => {
                  this.addButton = ref;
                }}
                onClick={this.onClickAdd}>
                <i className="ion ion-plus" /> Add person
              </button>
            </span>
            <span
              className="pull-right open_panel_btn"
              style={{ width: '25%' }}>
              <SearchBox schema={schema} />
            </span>
            People - Manage
          </div>
        </header>
        <div className="row">
          <div className="col-md-12">
            <PersonaList
              filter={queryStringToQuery(this.props.searchString, schema)}
              ModelForm={PersonaView}
              buttons={[ToggleMergeButton, DeleteButton]}
              saveParams={{ populate: 'personaIdentifiers' }}
              getDescription={model => this.getPersonaName(model)} />
          </div>
        </div>
        <PeopleImport isOpened={openModal === true} {...popupProps} />
      </div>
    );
  };
}

export default connect(
  state => ({
    searchString: modelQueryStringSelector(schema)(state),
    params: routeNodeSelector('organisation.people.manage')(state).route.params
  }),
  { addModel }
)(PersonaManage);
