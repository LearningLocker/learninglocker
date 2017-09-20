import React, { Component, PropTypes } from 'react';
import { IN_PROGRESS, COMPLETED } from 'ui/utils/constants';
import { Map } from 'immutable';
import { SmallSpinner } from 'ui/components';
import classNames from 'classnames';
import { withModel } from 'ui/utils/hocs';

class SaveButton extends Component {
  static propTypes = {
    schema: PropTypes.string,
    id: PropTypes.string,
    saveModel: PropTypes.func,
    saveParams: PropTypes.object,
    model: PropTypes.instanceOf(Map),
    white: PropTypes.bool,
    disabled: PropTypes.bool,
    onBeforeSave: PropTypes.func,
    small: PropTypes.bool,
    className: PropTypes.string,
  }

  static defaultProps = {
    model: new Map(),
    disabled: false,
    saveParams: null,
    onBeforeSave: () => null,
  }

  isDisabled = () => {
    const { model } = this.props;
    return model.getIn(['errors', 'hasErrors'], this.props.disabled);
  }

  onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onBeforeSave(this.props.schema, this.props.id);
    this.props.saveModel(this.props.schema, this.props.id, null, this.props.saveParams);
  }

  renderButtonContent = () => {
    const saveState = this.props.model.get('saveState');

    switch (saveState) {
      case IN_PROGRESS: return (<SmallSpinner />);
      case COMPLETED: return (<i className="icon animated fadeIn ion-checkmark" />);
      default: return (<span><i className="fa fa-floppy-o" /></span>);
    }
  }

  render = () => {
    const { className } = this.props;
    const classes = classNames({
      [className]: true,
      btn: true,
      'btn-sm': !this.props.small,
      'btn-xs': this.props.small,
      'btn-inverse': !this.props.white && !this.props.small,
      'flat-white flat-btn': this.props.white,
      'btn-default': this.props.small || this.props.white
    });
    const width = this.props.small ? '22.5px' : '33px';
    return (
      <button
        className={classes}
        title="Save"
        onClick={this.onClick}
        disabled={this.isDisabled()}
        style={{ width }}>
        {this.renderButtonContent()}
      </button>
    );
  }
}

export default withModel(SaveButton);

