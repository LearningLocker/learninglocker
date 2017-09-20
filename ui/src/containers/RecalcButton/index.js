/* eslint-disable react/jsx-indent */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { recalcJourney } from 'ui/redux/modules/journeys';
import { Map } from 'immutable';
import classNames from 'classnames';
import { withModel } from 'ui/utils/hocs';
import { withProps, compose } from 'recompose';

class RecalcButton extends Component {
  static propTypes = {
    id: PropTypes.string,
    recalcJourney: PropTypes.func,
    model: PropTypes.instanceOf(Map),
    white: PropTypes.bool,
    disabled: PropTypes.bool,
    small: PropTypes.bool,
    className: PropTypes.string,
  }

  static defaultProps = {
    model: new Map(),
    disabled: false,
  }

  isDisabled = () => {
    const { model } = this.props;
    const hasErrors = model.getIn(['errors', 'hasErrors']);
    const notActive = !model.get('isActive');
    const alreadyWorking = model.getIn(['recalculateStatus', 'inProgress']);
    return this.props.disabled || hasErrors || notActive || alreadyWorking;
  }

  onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.recalcJourney(this.props.id, null);
  }

  renderButtonContent = () => {
    const recalculateStatus = this.props.model.get('recalculateStatus', new Map());
    return recalculateStatus.get('inProgress') ? (
      <i style={{ display: 'block' }} className="ion-gear-a animated rotate infinite" />
    ) : (
      <i className="ion-refresh " />
    );
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
        onClick={this.onClick}
        disabled={this.isDisabled()}
        style={{ width }}>
        {this.renderButtonContent()}
      </button>
    );
  }
}

export default compose(
  withProps({
    doWhile: (model) => {
      const recalculateStatus = model.getIn(['recalculateStatus', 'inProgress']);
      return recalculateStatus;
    }
  }),
  withModel,
  connect(() => ({}), { recalcJourney })
)(RecalcButton);
