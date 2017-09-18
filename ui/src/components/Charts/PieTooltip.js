import React, { Component, PropTypes } from 'react';
import { List } from 'immutable';
import { round } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

class PieTooltip extends Component {
  static propTypes = {
    payload: PropTypes.arrayOf(PropTypes.object),
    labels: PropTypes.instanceOf(List),
    active: PropTypes.bool,
    display: PropTypes.func,
  }

  static defaultProps = {
    display: label => label,
  }

  getLabel = label => i =>
    label || `Series ${i + 1}`

  getValue = entry => i =>
    round(entry[`s${i}`], 2)

  renderLabel = entry => (label, i) => (
    <p key={i}>
      {`${this.getLabel(label)(i)} - ${this.getValue(entry)(i)}`}
    </p>
  )

  render = () => {
    const { display, active } = this.props;

    if (active) {
      const { payload, labels } = this.props;
      const entry = payload[0];
      return (
        <div className={styles.customTooltip}>
          <p className={styles.label}>{`${display(entry.id)}`}</p>
          <div className={styles.value}>
            {labels.map(this.renderLabel(entry))}
          </div>
        </div>
      );
    }

    return null;
  }
}
export default withStyles(styles)(PieTooltip);
