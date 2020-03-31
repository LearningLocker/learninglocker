import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { identity, noop } from 'lodash';
import classNames from 'classnames';
import styled from 'styled-components';

const Wrapper = styled.div`
  border-radius: 2px;
  background: #fff;
  margin: 3px;
  overflow: hidden;
  border: 1px solid #ccc;
  display: inline-flex;
  height: 100%;

  &.wrapperFullWidth {
    flex-grow: 1;
    border: none;
  }
`;

const RemoveButton = styled.div`
  margin-left: 2px;
  justify-content: flex-end;
  display: flex;
  align-items: center;
  padding: 0 6px;
  color: #888;
  font-size: 10px;
  border-left: 1px solid #ccc;
  line-height: 100%;
  cursor: pointer;

  &:hover {
    color: #777;
    background: #eee;
  }
`;

const Value = styled.div`
  font-size: 12px;
  padding: 2px 5px;
  justify-content: flex-start;
  word-break: break-word;
`;

class Token extends Component {
  static displayName = 'Token';

  static propTypes = {
    handleRemove: PropTypes.func,
    index: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    parse: PropTypes.func, // (value: any) => String
    parseTooltip: PropTypes.func, // (value: any) => String
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

  renderRemoveBtn = () => {
    const { fullWidth } = this.props;

    if (fullWidth) {
      return null;
    }

    return (
      <RemoveButton
        onClick={this.onRemoveBtnClick}>
        <i className="ion-close-round" />
      </RemoveButton>
    );
  };

  render() {
    const { fullWidth, value, parse, parseTooltip } = this.props;
    const wrapperClasses = classNames({ wrapperFullWidth: fullWidth });
    const parsedValue = parse(value);
    const title = parseTooltip(value);

    return (
      <Wrapper title={title} className={wrapperClasses}>
        <Value>
          { parsedValue }
        </Value>
        {this.renderRemoveBtn()}
      </Wrapper>
    );
  }
}

export default Token;
