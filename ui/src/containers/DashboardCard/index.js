import React, { Component } from 'react';
import Scroll from 'react-scroll';
import * as _ from 'lodash';
import classNames from 'classnames';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { loggedInUserId } from 'ui/redux/selectors';
import { actions, routeNodeSelector } from 'redux-router5';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import { COPY_DASHBOARD } from 'ui/redux/modules/dashboard/copyDashboard';
import { withProps, compose, lifecycle, withHandlers, mapProps } from 'recompose';
import { getVisualisationsFromDashboard } from 'ui/redux/modules/dashboard/selectors';
import { BLANK_DASHBOARD, STREAM_STARTER } from 'lib/constants/dashboard';
import Owner from 'ui/containers/Owner';
import { withModel } from 'ui/utils/hocs';
import DeleteConfirm from 'ui/containers/DeleteConfirm';
import DropDownMenu from 'ui/components/DropDownMenu';
import EditConfirm from 'ui/containers/EditConfirm';
import PrivacyToggleModal from 'ui/containers/PrivacyToggleModal';
import ConfirmModal from 'ui/components/Modal/ConfirmModal';
import blankDashboardIcon from './assets/blank-dashboard.png';
import streamStarterIcon from './assets/stream-starter.png';
import gettingStartedIcon from './assets/getting-started.png';
import privateIcon from './assets/private.png';
import styles from './styles.css';

const schema = 'dashboard';

export class DashboardCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditOpen: null,
      isDeleteOpen: null,
      isDuplicateOpen: null,
      isPrivacyOpen: null
    };
  }

  openModal = (modal) => {
    this.setState({
      [modal]: true
    });
  }

  closeModal = (modal) => {
    this.setState({
      [modal]: null
    });
  }

  handlerDuplicate = () => {
    const { doCopyDashboard } = this.props;
    doCopyDashboard();
    this.closeModal('isDuplicateOpen');
  };

  renderMenu = () => {
    const { model } = this.props;
    const { isEditOpen, isDeleteOpen, isDuplicateOpen, isPrivacyOpen } = this.state;
    const isPublic = model.get('isPublic', false);

    return (
      <div>
        <DropDownMenu
          customClass={styles.dashboardCardMenu}
          button={
            <a className={styles.menuButton}>
              <i className="ion ion-navicon-round" />
            </a>
          }>
          <a
            onClick={() => { this.openModal('isEditOpen'); }}
            title="Edit Title">
            Edit Title
          </a>

          <a
            onClick={() => { this.openModal('isDuplicateOpen'); }}
            title="Duplicate">
            Duplicate
          </a>

          <a
            onClick={() => { this.openModal('isPrivacyOpen'); }}
            title="Privacy toggle">
            {isPublic
              ? <span>Set to Private</span>
              : <span>Set to Public</span>}
          </a>

          <a
            onClick={() => { this.openModal('isDeleteOpen'); }}
            title="Delete button">
            Delete
          </a>
        </DropDownMenu>

        <EditConfirm
          id={model.get('_id')}
          schema={schema}
          onClickClose={() => { this.closeModal('isEditOpen'); }}
          isOpened={isEditOpen} />

        <ConfirmModal
          isOpen={isDuplicateOpen}
          title="Confirm copy"
          message={<span>This will duplicate the dashboard and visualisations. Are you sure?</span>}
          onConfirm={this.handlerDuplicate}
          onCancel={() => { this.closeModal('isDuplicateOpen'); }} />

        <PrivacyToggleModal
          id={model.get('_id')}
          schema={schema}
          onClickClose={() => { this.closeModal('isPrivacyOpen'); }}
          isOpened={isPrivacyOpen} />

        <DeleteConfirm
          isOpened={isDeleteOpen}
          schema={schema}
          id={model.get('_id')}
          onClickClose={() => { this.closeModal('isDeleteOpen'); }} />
      </div>
    );
  }

  render = () => {
    const {
      model,
      handleDashboard,
      index
    } = this.props;
    const title = model.get('title', ' ');
    const isPublic = model.get('isPublic', false);

    const iconType = () => {
      const type = model.get('type', ' ');

      if (type === BLANK_DASHBOARD) {
        return blankDashboardIcon;
      }
      if (type === STREAM_STARTER) {
        return streamStarterIcon;
      }
      return gettingStartedIcon;
    };

    return (
      <div
        className={styles.dashboardCard} >
        <div className={styles.menuWrapper}>
          {this.renderMenu()}
        </div>
        <div
          key={index}
          onClick={handleDashboard}
          className={classNames(styles.card)}>
          <img
            className={styles.cardIcon}
            src={iconType()}
            alt={title} />

          {!isPublic && (
            <span
              className={styles.dashboardPrivateIcon} >
              <img
                src={privateIcon}
                alt="private" />
            </span>
          )}


          <h4
            className={styles.cardTitle}
            onClick={handleDashboard} >
            {title}
          </h4>

          <span style={{ marginLeft: 'auto' }}>
            <Owner model={model} />
          </span>
        </div>
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
  withProps(({ model }) => ({
    id: model.get('_id'),
  })),
  withModel,
  lifecycle({
    componentDidUpdate(previousProps) {
      if (this.props.model.get('widgets').size > previousProps.model.get('widgets').size && window) {
        const scroll = Scroll.animateScroll;
        scroll.scrollToBottom({ smooth: true });
      }
    }
  }),
  connect(
    state => ({
      route: routeNodeSelector('organisation.dashboards')(state).route,
      organisationId: activeOrgIdSelector(state),
      userId: loggedInUserId(state),
      state
    }),
    dispatch => ({
      copyDashboard: ({ dashboard, visualisations, organisationId, userId }) => dispatch({
        type: COPY_DASHBOARD,
        dispatch,
        dashboard,
        visualisations,
        organisationId,
        userId,
        navigateTo: actions.navigateTo,
      }),
    }),
  ),
  withHandlers({
    doCopyDashboard: ({ model, state, organisationId, copyDashboard, userId }) => () => copyDashboard({
      dashboard: model,
      visualisations: getVisualisationsFromDashboard(model.get('_id'))(state),
      organisationId,
      userId,
    }),
    handleDashboard: ({
      model,
      navigateTo,
      route,
    }) => () => {
      const organisationId = route.params.organisationId;
      const dashboardId = model.get('_id');
      if (dashboardId) {
        navigateTo('organisation.data.dashboards.id', {
          organisationId,
          dashboardId
        });
      }
    }
  }),
  mapProps(original => _.pick(original, ['model', 'handleDashboard', 'doCopyDashboard'])),
)(DashboardCard);
