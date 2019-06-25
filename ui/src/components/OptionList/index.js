import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List as ImmutableList } from 'immutable';
import { AutoSizer, List, InfiniteLoader } from 'react-virtualized';
import { noop } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import keyCodes from 'lib/constants/keyCodes';
import OptionListItemWrapper from 'ui/components/OptionListItemWrapper';
import OptionListItem from 'ui/components/OptionListItem';
import areEqualProps from 'ui/utils/hocs/areEqualProps';
import styles from './styles.css';

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

  getHighLighted = () => {
    if (!this.props.options.size) {
      return 0;
    }

    if (this.props.options.size <= this.state.highlighted) {
      return this.props.options.size - 1;
    }

    return this.state.highlighted;
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
        const option = this.props.options.get(this.getHighLighted());
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
    const currentHighlighted = this.getHighLighted();
    this.setState({
      highlighted: !currentHighlighted
        ? this.props.options.size - 1
        : currentHighlighted - 1
    });
  }

  selectNext = () => {
    const currentHighlighted = this.getHighLighted();
    this.setState({
      highlighted: currentHighlighted === this.props.options.size - 1
        ? 0
        : currentHighlighted + 1
    });
  }

  handleSelect = (index) => {
    this.setState({ highlighted: index });
  }

  isRowLoaded = ({ index }) => this.props.options.has(index);

  renderOptions = () => {
    const rowCount = this.props.rowCount || this.props.options.size;
    const rowHeight = 36;

    const highlighted = this.getHighLighted();
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
      highlighted={index === this.getHighLighted()}
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
      <div className={styles.wrapper} >
        <div>
          {displayEmptyInfo ? this.renderEmptyInfo(styles) : this.renderOptions(styles) }
          { children ? (
            <div>
              <div className={styles.divider} />
              { children }
            </div>
          ) : null }
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(OptionList);
