import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { withProps, compose } from 'recompose';
import {
  queryStringToQuery,
  modelQueryStringSelector
} from 'ui/redux/modules/search';
import { withModels, withModel } from 'ui/utils/hocs';
import { addModel } from 'ui/redux/modules/models';
import { routeNodeSelector } from 'redux-router5';
import ModelList from 'ui/containers/ModelList';
import SearchBox from 'ui/containers/SearchBox';
import PersonaView from './PersonaView';

const schema = 'persona';
const PersonaList = compose(
  withProps({
    schema,
    sort: fromJS({ _id: -1 })
  }),
  withModels,
  withModel
)(ModelList);

class PersonaManage extends Component {
  static propTypes = {
    addModel: PropTypes.func,
    personaId: PropTypes.string // optional
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

  render = () =>
    (
      <div>
        <header id="topbar">
          <div className="heading heading-light">
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
              id={this.props.personaId}
              filter={queryStringToQuery(this.props.searchString, schema)}
              ModelForm={PersonaView}
              saveParams={{ populate: 'personaIdentifiers' }}
              getDescription={model => this.getPersonaName(model)} />
          </div>
        </div>
      </div>
    );
}

export default connect(
  state => ({
    searchString: modelQueryStringSelector(schema)(state),
    params: routeNodeSelector('organisation.people.manage')(state).route.params,
    personaId: routeNodeSelector('organisation.people.manage.persona')(state).route.params.personaId
  }),
  { addModel }
)(PersonaManage);
