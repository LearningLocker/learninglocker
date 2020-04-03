import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Map } from 'immutable';
import DeleteButton from 'ui/containers/DeleteButton';
import ProgressBar from 'ui/containers/ProgressBar';
import Owner from 'ui/containers/Owner';
import { withProps, compose } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import { BuilderDescription, Creator, Wrapper } from 'ui/containers/ModelListItem/styled';

export class ModelListItem extends Component {
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
      <Wrapper
        isExpanded={isExpanded}
        className={'panel panel-default'} style={style}>
        <div className={headerClasses} onClick={this.expandItem} >
          <span className="pull-right right-btns">
            { buttons.map((Button, key) =>
              (<Button schema={schema} id={model.get('_id')} key={key} />)
            )}
          </span>
          <i className={iconClasses} />
          <BuilderDescription title={getIdentifier(model)}>
            {getDescription(model)}
          </BuilderDescription>
          { displayOwner &&
            <Creator className={'pull-right hidden-sm hidden-xs'}>
              <Owner model={model} />
            </Creator>
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
      </Wrapper>
    );
  }
}

export default compose(
  withProps(({ model }) => ({
    id: model.get('_id'),
  })),
  withModel
)(ModelListItem);
