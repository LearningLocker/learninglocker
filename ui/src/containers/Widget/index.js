import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import {
  COUNTER,
  PIE,
  TEMPLATE_LAST_7_DAYS_STATEMENTS,
  TEMPLATE_STREAM_COMMENT_COUNT
} from 'lib/constants/visualise';
import { fetchModels } from 'ui/redux/modules/pagination';
import { updateModel, modelsSchemaIdSelector } from 'ui/redux/modules/models';
import { setModelQuery } from 'ui/redux/modules/search';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import Link from 'ui/containers/Link';
import DropDownMenu from 'ui/components/DropDownMenu';
import WidgetVisualisePicker from 'ui/containers/WidgetVisualisePicker';
import VisualisationViewer from 'ui/containers/Visualisations/VisualisationViewer';
import DeleteConfirm from 'ui/containers/DeleteConfirm';
import { createDefaultTitle } from 'ui/utils/defaultTitles';
import {
  CloseButton,
  MenuButton,
  Widget as StyledWidget,
  WidgetBody,
  WidgetDropdownIcon,
  WidgetContent,
  WidgetHeading,
  WidgetTitle
} from './styled';

const schema = 'widget';
const VISUALISATION = 'stages/VISUALISATION';

class Widget extends Component {
  static propTypes = {
    editable: PropTypes.bool,
    model: PropTypes.instanceOf(Map),
    visualisation: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func,
    organisationId: PropTypes.string,
    onDelete: PropTypes.func,
    onChangeTitle: PropTypes.func,
    onChangeVisualisation: PropTypes.func,
  }

  static contextTypes = {
    router: PropTypes.any
  }

  static defaultProps = {
    editable: true,
    model: new Map(),
  }

  constructor(props) {
    super(props);
    this.state = {
      isDeleteOpen: null,
      openModalStep: null
    };
  }

  onChangeAttr = (attr, e) => this.props.updateModel({
    schema,
    id: this.props.model.get('_id'),
    path: attr,
    value: e.target.value
  });

  closeModal = () => {
    this.setState({
      openModalStep: null
    });
  }

  closeDeleteModal = () => {
    this.setState({
      isDeleteOpen: null
    });
  }

  openModal = (step) => {
    this.setState({
      openModalStep: step
    });
  }

  toggleSourceView = () => {
    this.props.updateModel({
      schema: 'visualisation',
      id: this.props.model.get('visualisation'),
      path: 'sourceView',
      value: !this.props.visualisation.get('sourceView')
    });
  }

  toggleDonutView = () => {
    this.props.updateModel({
      schema: 'visualisation',
      id: this.props.model.get('visualisation'),
      path: 'isDonut',
      value: !this.props.visualisation.get('isDonut')
    });
  }

  openDeleteModal = () => {
    this.setState({
      isDeleteOpen: true
    });
  }

  getSourceView = () => {
    if (this.props.visualisation.get('sourceView')) {
      return 'Disable table view';
    }
    return 'Enable table view';
  }

  getDonutView = () => {
    if (this.props.visualisation.get('isDonut')) {
      return 'Disable donut';
    }
    return 'Enable donut';
  }

  getTitle = (model, props) =>
    model.get('title') ||
    props.visualisation.get('description') ||
    (
      <span style={{ color: '#BFC7CD', fontWeight: '100', fontSize: '0.9em' }}>
        {createDefaultTitle(this.props.visualisation)}
      </span>
    );

  isCounter = type => type === COUNTER || type === TEMPLATE_LAST_7_DAYS_STATEMENTS || type === TEMPLATE_STREAM_COMMENT_COUNT

  renderMenu = () => {
    const { model, organisationId, visualisation } = this.props;

    const shouldShowTableModeToggle = (
      visualisation.size > 0 &&
      visualisation.get('type') &&
      !this.isCounter(visualisation.get('type')) &&
      model.has('visualisation')
    );

    const shouldShowDonutModeToggle = (
      visualisation.size > 0 &&
      visualisation.get('type') === PIE &&
      !visualisation.get('sourceView') &&
      model.has('visualisation')
    );

    const shouldShowGoVisualisation = (
      model.has('visualisation') &&
      visualisation.size > 0
    );

    return (
      <DropDownMenu
        button={
          <MenuButton>
            <i className="ion ion-navicon-round" />
          </MenuButton>
        }>
        {shouldShowTableModeToggle &&
          <CloseButton
            onClick={this.toggleSourceView}
            title="Table mode" >
            <WidgetDropdownIcon className={'ion ion-edit grey'} />{this.getSourceView()}
          </CloseButton>
        }

        {shouldShowDonutModeToggle &&
          <CloseButton
            onClick={this.toggleDonutView}
            title="Donut mode" >
            <WidgetDropdownIcon className={'ion ion-edit grey'} />{this.getDonutView()}
          </CloseButton>
        }

        {shouldShowGoVisualisation &&
          <Link
            routeName={'organisation.data.visualise.visualisation'}
            routeParams={{ organisationId, visualisationId: visualisation.get('_id') }} >
            <WidgetDropdownIcon className={'ion ion-edit grey'} />
            Go to visualisation
          </Link>
        }

        <a
          onClick={this.openModal.bind(null, VISUALISATION)}
          title="Edit widget visualisation or title">
          <WidgetDropdownIcon className={'ion ion-gear-b grey'} />
          Edit Widget
        </a>

        {this.props.editable &&
          <a
            onClick={this.openDeleteModal}
            title="Delete Widget">
            <WidgetDropdownIcon className={'ion ion-close-round grey'} />
            Delete
          </a>
        }
      </DropDownMenu>
    );
  }

  render = () => {
    const { model } = this.props;
    const delPopupProps = {
      schema,
      onClickClose: this.closeDeleteModal,
      onDelete: this.props.onDelete
    };
    const suggestedStep = model.get('suggestedStep');
    const { openModalStep, isDeleteOpen } = this.state;
    const isModalOpen = openModalStep === VISUALISATION || suggestedStep === VISUALISATION;

    return (
      <StyledWidget className={'panel panel-default animated fadeIn'}>
        <WidgetContent>
          <WidgetHeading className={'panel-heading'}>
            <WidgetTitle className={'panel-title react-drag-handle'}>
              {this.props.editable && this.renderMenu()}
              <span style={{ cursor: 'initial' }}>{this.getTitle(model, this.props)}</span>
            </WidgetTitle>
          </WidgetHeading>
          {
            <WidgetBody className={'panel-body'}>
              {model.has('visualisation') && (
                <VisualisationViewer id={model.get('visualisation')} />
              )}
            </WidgetBody>
          }
          {
            (isModalOpen) &&
            <WidgetVisualisePicker
              isOpened={isModalOpen || this.props.widgetModalOpen}
              model={model}
              onClickClose={this.closeModal}
              onChangeTitle={this.props.onChangeTitle}
              onChangeVisualisation={this.props.onChangeVisualisation} />
          }
          <DeleteConfirm key={model.get('_id')} isOpened={isDeleteOpen} {...delPopupProps} />
        </WidgetContent>
      </StyledWidget>
    );
  }
}

export default compose(
  connect(
    (state, { model }) => ({
      visualisation: modelsSchemaIdSelector('visualisation', model.get('visualisation'))(state),
      organisationId: activeOrgIdSelector(state),
    }),
    { updateModel, setModelQuery, fetchModels }
  ),
)(Widget);
