import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { identity, noop } from 'lodash';
import classNames from 'classnames';
import RemoveButton from './RemoveButton';
import Value from './Value';
import Wrapper from './Wrapper';

class Token extends Component {
  static displayName = 'Token';

  static propTypes = {
    handleRemove: PropTypes.func,
    index: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    parse: PropTypes.func,
    parseTooltip: PropTypes.func,
    fullWidth: PropTypes.bool,
    value: PropTypes.any // eslint-disable-line react/forbid-prop-types
  }

  static defaultProps = {
    handleRemove: noop,
    parse: identity,
    parseTooltip: identity,
    index: 0,
    fullWidth: false
  }

  shouldComponentUpdate = nextProps => !(
    this.props.index === nextProps.index &&
    this.props.fullWidth === nextProps.fullWidth &&
    this.props.value === nextProps.value
  );

  onRemoveBtnClick = () => {
    this.props.handleRemove(this.props.value);
  }

  renderRemoveBtn = () => (
    <RemoveButton onClick={this.onRemoveBtnClick}>
      <i className="ion-close-round" />
    </RemoveButton>
  );

  render() {
    const { fullWidth, value, parse, parseTooltip } = this.props;
    const wrapperClasses = classNames({ fullWidth });
    const parsedValue = parse(value);
    const parsedIdent = parseTooltip(value);
    const title = parsedIdent;
    return (
      <Wrapper title={title} className={wrapperClasses}>
        <Value>{parsedValue}</Value>
        {!fullWidth ? this.renderRemoveBtn() : null}
      </Wrapper>
    );
  }
}

export default Token;
