import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Portal from 'react-portal';
import uuid from 'uuid';
import { fromJS } from 'immutable';
import { withProps, compose } from 'recompose';
import { queryStringToQuery, modelQueryStringSelector } from 'ui/redux/modules/search';
import { clearModelsCache as clearModelsCacheAction } from 'ui/redux/modules/pagination';
import { deleteUserOrganisation as deleteUserOrganisationAction } from 'ui/redux/modules/userOrganisations';
import { withModels, withModel } from 'ui/utils/hocs';
import { addModel } from 'ui/redux/modules/models';
import UserPicture from 'ui/components/UserPicture';
import SearchBox from 'ui/containers/SearchBox';
import ModelList from 'ui/containers/ModelList';
import DeleteButton from 'ui/containers/DeleteButton';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import classNames from 'classnames';
import ValidationList from 'ui/components/ValidationList';
import UserOrgForm from './UserOrgForm';

const UserDeleteButton = compose(
  connect(
    state => ({
      organisationId: activeOrgIdSelector(state)
    }),
    {
      clearModelsCache: clearModelsCacheAction,
      deleteUserOrganisation: deleteUserOrganisationAction,
    }
  ),
  withModel,
  withProps(({ clearModelsCache, deleteUserOrganisation, model, organisationId }) => ({
    renderMessage: () => 'This will remove the user from this organisation',
    onDelete: () => {
      deleteUserOrganisation({
        userId: model.get('_id'),
        organisationId,
      }).then(() => {
        clearModelsCache({ schema: 'user' });
      });
    }
  })),
)(DeleteButton);

const schema = 'user';

const UserList = compose(
  withProps({
    schema,
    sort: fromJS({ createdAt: -1, _id: -1 })
  }),
  withModels
)(ModelList);

class Users extends Component {
  static propTypes = {
    addModel: PropTypes.func,
    searchString: PropTypes.string
  };

  state = {
    isModalOpen: false,
    error: false
  }

  onSubmit = async (event) => {
    event.preventDefault();

    try {
      await this.props.addModel({
        schema,
        props: {
          email: this.inviteEmail.value,
          isExpanded: true
        }
      });
      this.setState({ isModalOpen: false });
    } catch (ex) {
      this.setState({ error: ex.message });
    }
  }

  onClickOpenModal = () => {
    this.addButton.blur();
    this.setState({ isModalOpen: true });
  }

  onClickCloseModal = () => {
    this.setState({ isModalOpen: false });
  }

  renderUserDescription = (model) => {
    const name = model.get('name', model.get('email'));

    return (
      <span>
        <UserPicture model={model} className="pull-left" />
        {name}
        {model.has('googleId') &&
          <i
            className="ion ion-social-googleplus"
            style={{ marginLeft: '1em', fontWeight: 'bold' }} />
        }
      </span>
    );
  }

  renderInviteModal = () => {
    const emailId = uuid.v4();
    return (
      <Portal isOpened={this.state.isModalOpen}>
        <span>
          <div className="modal animated fast fadeIn">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header modal-header-bg">
                  <button type="button" className="close" aria-label="Close" onClick={this.onClickCloseModal}><span aria-hidden="true">&times;</span></button>
                  <h4 className="modal-title">Invite user</h4>
                </div>
                <form onSubmit={this.onSubmit}>
                  <div className="modal-body clearfix">
                    <div
                      className={classNames({
                        'form-group': true,
                        'has-error': this.state.error
                      })} >
                      <label htmlFor={emailId}>Email address</label>
                      <input
                        autoFocus
                        id={emailId}
                        className="form-control"
                        type="text"
                        ref={(ref) => { this.inviteEmail = ref; }} />
                      {this.state.error &&
                        (<span className="help-block">
                          <ValidationList errors={fromJS([this.state.error])} />
                        </span>
                        )
                      }
                    </div>
                  </div>
                  <div className="modal-footer">
                    <div className="col-xs-12 clearfix">
                      <button className="btn btn-primary btn-sm pull-right">
                        <i className="icon ion-paper-airplane" />{' Send invite'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="modal-backdrop" onClick={this.onClickCloseModal} />
          </div>
        </span>
      </Portal>
    );
  }

  render = () =>
    (<div>
      <header id="topbar">
        <div className="heading heading-light">
          <span className="pull-right open_panel_btn">
            <button
              className="btn btn-primary btn-sm"
              ref={(ref) => { this.addButton = ref; }}
              onClick={this.onClickOpenModal}>
              <i className="ion ion-plus" /> Invite
            </button>
          </span>
          <span className="pull-right open_panel_btn" style={{ width: '25%' }}>
            <SearchBox schema={schema} />
          </span>
          {this.renderInviteModal()}
          Users
        </div>
      </header>
      <div className="row">
        <div className="col-md-12">
          <UserList
            filter={queryStringToQuery(this.props.searchString, schema)}
            ModelForm={UserOrgForm}
            buttons={[UserDeleteButton]}
            getDescription={this.renderUserDescription} />
        </div>
      </div>
    </div>);
}

export default connect(
  state => ({ searchString: modelQueryStringSelector(schema)(state) }),
  { addModel }
)(Users);
