import React, { Component, PropTypes } from 'react';
import { round } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

class CustomTooltip extends Component {
  static propTypes = {
    payload: PropTypes.arrayOf(PropTypes.object),
    active: PropTypes.bool,
    display: PropTypes.func
  }

  getFirstTenNames = names => names.take(10).join(', ')

  getMoreNames = names => (names.size > 10 ? ', more...' : '')

  renderNames = names => (
    this.getFirstTenNames(names) + this.getMoreNames(names)
  )

  render = () => {
    const { active } = this.props;

    if (active) {
      const { payload } = this.props;
      const names = this.props.display(payload[0].value, payload[1].value);

      return (
        <div className={styles.customTooltip}>
          <div className={styles.label}>
            {this.renderNames(names)}
          </div>
          <p className={styles.value}>
            <span className={styles.customTooltipLabel}>{`${payload[0].name}`}</span>: {`${round(payload[0].value, 2)}`}
          </p>
          <p className={styles.value}>
            <span className={styles.customTooltipLabel}>{`${payload[1].name}`}</span>: {`${round(payload[1].value, 2)}`}</p>
        </div>
      );
    }

    return null;
  }
}

export default withStyles(styles)(CustomTooltip);
