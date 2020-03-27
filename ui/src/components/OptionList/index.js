import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List as ImmutableList } from 'immutable';
import { AutoSizer, List, InfiniteLoader } from 'react-virtualized';
import { noop } from 'lodash';
import styled from 'styled-components';

import OptionListItemWrapper from 'ui/components/OptionListItemWrapper';
import OptionListItem from 'ui/components/OptionListItem';
import areEqualProps from 'ui/utils/hocs/areEqualProps';
import keyCodes from 'lib/constants/keyCodes';

const Wrapper = styled.div`
  position: absolute;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 2px 2px;
  overflow: auto;
  background-color: #fff;
  width: 100%;
  z-index: 1;
  outline: none;

  div {
    outline: none;
  }
`;

const Divider = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eee;
`;

class OptionList extends Component {
  static propTypes = {
    options: PropTypes.instanceOf(ImmutableList),
    rowCount: PropTypes.number,
    handleAddSelected: PropTypes.func,
    children: PropTypes.node,
    renderOption: PropTypes.func,
    isLoading: PropTypes.bool,
    fetchMore: PropTypes.func
  }

  static defaultProps = {
    options: new ImmutableList(),
    emptyInfo: 'no suggestions',
    handleAddSelected: noop,
    isRowLoaded: () => true,
    fetchMore: () => Promise.resolve(),
    renderOption: option => (<span>{option}</span>)
  }

  state = {
    highlighted: 0
  }

  componentDidMount() {
    if (window) {
      window.addEventListener('keydown', this.onKeyDown);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const p = areEqualProps(this.props, nextProps);
    const s = areEqualProps(this.state, nextState);
    return !p || !s;
  }

  componentWillUnmount() {
    if (window) {
      window.removeEventListener('keydown', this.onKeyDown);
    }
  }

  getHighLighted = (props, state) => {
    if (!props.options.size) {
      return 0;
    }

    if (props.options.size <= state.highlighted) {
      return props.options.size - 1;
    }

    return state.highlighted;
  }

  onKeyDown = (e) => {
    switch (e.keyCode) {
      case keyCodes.UP: {
        this.selectPrev();
        e.preventDefault();
        break;
      }
      case keyCodes.DOWN: {
        this.selectNext();
        e.preventDefault();
        break;
      }
      case keyCodes.ENTER: {
        const option = this.props.options.get(this.getHighLighted(this.props, this.state));
        if (option) {
          this.props.handleAddSelected(option);
        }
        e.preventDefault();
        break;
      }
      default: break;
    }
  }

  selectPrev = () => {
    this.setState((state, props) => {
      const currentHighlighted = this.getHighLighted(props, state);
      return {
        highlighted: !currentHighlighted
          ? this.props.options.size - 1
          : currentHighlighted - 1
      };
    });
  }

  selectNext = () => {
    this.setState((state, props) => {
      const currentHighlighted = this.getHighLighted(props, state);
      return {
        highlighted: currentHighlighted === this.props.options.size - 1
          ? 0
          : currentHighlighted + 1
      };
    });
  }

  handleSelect = (index) => {
    this.setState({ highlighted: index });
  }

  isRowLoaded = ({ index }) => this.props.options.has(index);

  renderOptions = () => {
    const rowCount = this.props.rowCount || this.props.options.size;
    const rowHeight = 36;

    const highlighted = this.getHighLighted(this.props, this.state);
    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <InfiniteLoader
            isRowLoaded={this.isRowLoaded}
            loadMoreRows={this.props.fetchMore}
            rowCount={rowCount} >
            {({ onRowsRendered, registerChild }) => (
              <List
                options={this.props.options}
                ref={registerChild}
                onRowsRendered={onRowsRendered}
                width={width}
                height={Math.min(6, rowCount) * rowHeight}
                rowCount={rowCount}
                rowHeight={rowHeight}
                scrollToIndex={highlighted}
                rowRenderer={this.renderRow} />
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    );
  }

  renderOption = (index, value, style, key) => (
    <OptionListItemWrapper
      style={style}
      key={key}
      index={index}
      onClick={this.props.handleAddSelected}
      handleSelect={this.handleSelect}
      highlighted={index === this.getHighLighted(this.props, this.state)}
      value={value}>
      {this.props.renderOption(value)}
    </OptionListItemWrapper>
  );

  renderRow = ({ index, style, key }) => {
    const { options } = this.props;
    const value = options.get(index);
    if (!value) return null;
    return this.renderOption(index, value, style, key);
  }

  renderEmptyInfo = () => (
    <OptionListItemWrapper>
      <OptionListItem label={this.props.isLoading ? 'Loading...' : 'No items'} />
    </OptionListItemWrapper>
  )

  render() {
    const { options, children } = this.props;
    const displayEmptyInfo = !options.size;

    return (
      <Wrapper>
        <div>
          {
            displayEmptyInfo
              ? this.renderEmptyInfo()
              : this.renderOptions()
          }
          {
            children
              ? (
                <div>
                  <Divider />
                  {children}
                </div>
              )
              : null
          }
        </div>
      </Wrapper>
    );
  }
}

export default OptionList;
