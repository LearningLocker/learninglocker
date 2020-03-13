import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Dropdown from '../Dropdown/Dropdown';

const StyledSelect = styled.div`
  position: relative;
  cursor: pointer;

  &:focus {
    outline: 0;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
`;

const Value = styled.div`
  justify-content: flex-start;
  flex-grow: 1;
`;

const Indicator = styled.div`
  margin-left: 2px;
  justify-content: flex-end;
  width: 10px;
`;

class Select extends Component {
  static propTypes = {
    value: PropTypes.string,
    children: PropTypes.node,
    onSelect: PropTypes.func,
  }

  state = {
    focused: false,
  }

  focus = () => {
    this.setState({ focused: true });
  }

  blur = () => {
    this.setState({ focused: false });
  }

  render = () => (
    <StyledSelect
      onFocus={this.focus}
      onBlur={this.blur}
      tabIndex={0}>
      <Content className={'btn btn-default btn-xs'}>
        <Value>{this.props.value}</Value>
        <Indicator>
          {
            this.state.focused
              ? (<div className="ion-arrow-down-b" />)
              : (<div className="ion-arrow-up-b" />)
          }
        </Indicator>
      </Content>
      {
        this.state.focused &&
        <Dropdown onSelect={this.props.onSelect}>
          {this.props.children}
        </Dropdown>
      }
    </StyledSelect>
  );
}

export default Select;
