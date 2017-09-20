import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import { fetchModels } from 'ui/redux/modules/pagination';
import { updateModel, modelsSchemaIdSelector } from 'ui/redux/modules/models';
import { setModelQuery } from 'ui/redux/modules/search';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import Link from 'ui/containers/Link';
import DropDownMenu from 'ui/components/DropDownMenu';
import WidgetVisualisePicker from 'ui/containers/WidgetVisualisePicker';
import VisualiseResults from 'ui/containers/VisualiseResults';
import DeleteConfirm from 'ui/containers/DeleteConfirm';
import styles from './widget.css';

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
      openModalStep: null,
      editingTitle: false
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

  openDeleteModal = () => {
    this.setState({
      isDeleteOpen: true
    });
  }

  renderTitle = () => {
    const { model } = this.props;
    const isEditingTitle = true;
    return isEditingTitle ? (
      <span>{model.get('title')}</span>
    ) : (
      null
    );
  }

  renderMenu = () => {
    const { model, organisationId } = this.props;
    return (
      <DropDownMenu
        button={
          <a className={styles.menuButton}>
            <i className="ion ion-navicon-round" />
          </a>
        }>
        {
          model.has('visualisation') &&
            <Link
              routeName={'organisation.data.visualise'}
              routeParams={{ organisationId, visualisationId: this.props.visualisation.get('id') }} >
              <i className={`ion ${styles.marginRight} ion-edit grey`} />
              Edit
            </Link>
        }
        <a onClick={this.openModal.bind(null, VISUALISATION)} title="Widget settings">
          <i className={`ion ${styles.marginRight} ion-gear-b grey`} />
          Settings
        </a>
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

    const titleStyles = classNames({
      [styles.title]: true,
      [styles.draggableTitle]: this.props.editable,
    });

    return (
      <div className={`panel panel-default animated fadeIn ${styles.widget}`} >
        <div className={styles.widgetContent}>
          <div
            className={`panel-heading ${styles.heading}`}
            onDoubleClick={this.toggleEditingTitle}>
            <div className={`panel-title ${titleStyles} react-drag-handle`}>
              { this.props.editable && this.renderMenu(styles) }
              <span style={{ cursor: 'initial' }}>{ model.get('title') }</span>
              { this.props.editable &&
                <a
                  onClick={this.openDeleteModal}
                  title="Delete"
                  className={styles.closeButton}>
                  <i className="ion ion-close-round grey" />
                </a>
              }
            </div>
          </div>
          <div className={`panel-body ${styles.body}`}>
            { model.has('visualisation') &&
              <VisualiseResults id={model.get('visualisation')} />
            }
          </div>
          {
            isModalOpen &&
              <WidgetVisualisePicker
                isOpened={isModalOpen}
                model={model}
                onClickClose={this.closeModal}
                onChangeTitle={this.props.onChangeTitle}
                onChangeVisualisation={this.props.onChangeVisualisation} />
          }
          <DeleteConfirm isOpened={isDeleteOpen} {...delPopupProps} />
        </div>
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
  connect((state, { model }) => ({
    visualisation: modelsSchemaIdSelector('visualisation', model.get('visualisation'))(state),
    organisationId: activeOrgIdSelector(state),
  }), { updateModel, setModelQuery, fetchModels })
)(Widget);
