import React, { Component, PropTypes } from 'react';
import { round, isUndefined } from 'lodash';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

class CustomTooltip extends Component {
  static propTypes = {
    payload: PropTypes.arrayOf(PropTypes.object),
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    active: PropTypes.bool,
    display: PropTypes.func,
  }

  static defaultProps = {
    display: label => label,
  }

  render = () => {
    const { display, active } = this.props;

    if (active) {
      const { payload, label } = this.props;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.label}>{`${display(label)}`}</p>
          <div className={styles.value}>
            {payload.map(val => (!isUndefined(val.value) ?
              (<p key={val.name}>{`${val.name} - ${round(val.value, 2)}`}</p>) :
              null
            ))}
          </div>
        </div>
      );
    }

    return null;
  }
}

export default withStyles(styles)(CustomTooltip);
