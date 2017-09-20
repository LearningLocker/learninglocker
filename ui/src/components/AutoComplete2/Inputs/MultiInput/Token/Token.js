import React, { Component, PropTypes } from 'react';
import { identity, noop } from 'lodash';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

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
    <div
      className={styles.removeBtn}
      onClick={this.onRemoveBtnClick}>
      <i className="ion-close-round" />
    </div>
  );

  render() {
    const { fullWidth, value, parse, parseTooltip } = this.props;
    const wrapperClasses = classNames({
      [styles.wrapper]: true,
      [styles.wrapperFullWidth]: fullWidth
    });
    const parsedValue = parse(value);
    const parsedIdent = parseTooltip(value);
    const title = parsedIdent;
    return (
      <div title={title} className={wrapperClasses}>
        <div className={styles.value}>
          { parsedValue }
        </div>
        { !fullWidth ? this.renderRemoveBtn(styles) : null}
      </div>
    );
  }
}

export default withStyles(styles)(Token);
