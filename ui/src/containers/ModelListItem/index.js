import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Map } from 'immutable';
import DeleteButton from 'ui/containers/DeleteButton';
import ProgressBar from 'ui/containers/ProgressBar';
import Owner from 'ui/containers/Owner';
import { withProps, compose } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import styles from './modellistitem.css';

class ModelListItem extends Component {
  static propTypes = {
    schema: PropTypes.string.isRequired,
    model: PropTypes.instanceOf(Map).isRequired,
    buttons: PropTypes.arrayOf(PropTypes.func),
    getDescription: PropTypes.func,
    getIdentifier: PropTypes.func,
    preExpand: PropTypes.func,
    postExpand: PropTypes.func,
    ModelForm: PropTypes.func.isRequired,
    setMetadata: PropTypes.func.isRequired,
    getMetadata: PropTypes.func.isRequired,
    displayOwner: PropTypes.bool,
  };

  static defaultProps = {
    model: new Map(),
    buttons: [DeleteButton],
    getDescription: model => model.get('description', ''),
    getIdentifier: model => model.get('_id', ''),
    preExpand: () => null,
    postExpand: () => null,
    displayOwner: true,
  };

  expandItem = () => {
    const { model, preExpand, postExpand, setMetadata, getMetadata } = this.props;
    preExpand(model);
    setMetadata('isExpanded', !getMetadata('isExpanded'));
    postExpand(model);
  }

  render = () => {
    const {
      model,
      schema,
      getDescription,
      getIdentifier,
      getMetadata,
      ModelForm,
      buttons,
      style,
      displayOwner,
      ...other
    } = this.props;
    const isExpanded = !!getMetadata('isExpanded');

    const wrapClasses = classNames({
      panel: true,
      'panel-default': true,
      [styles.expanded]: isExpanded,
      [styles.collapsed]: !isExpanded
    });

    const headerClasses = classNames({
      'panel-heading': true,
      pointer: true,
      'active-bg': isExpanded,
      clearfix: true
    });

    const iconClasses = classNames({
      icon: true,
      'ion-chevron-right': !isExpanded,
      'ion-chevron-down': isExpanded
    });

    return (
      <div className={wrapClasses} style={style}>
        <div className={headerClasses} onClick={this.expandItem} >
          <span className="pull-right right-btns">
            { buttons.map((Button, key) =>
              <Button schema={schema} id={model.get('_id')} key={key} />
            )}
          </span>
          <i className={iconClasses} />
          <span
            title={getIdentifier(model)}
            className={styles['builder-description']}>
            {getDescription(model)}
          </span>
          { displayOwner &&
            <span className={`${styles.creator} pull-right hidden-sm hidden-xs`}>
              <Owner model={model} />
            </span>
          }
        </div>

        {isExpanded &&
          <span>
            <ProgressBar model={model} schema={schema} />
            <div className="panel-body">
              <ModelForm model={model} {...other} />
            </div>
          </span>
        }
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
  withProps(({ model }) => ({
    id: model.get('_id'),
  })),
  withModel
)(ModelListItem);
