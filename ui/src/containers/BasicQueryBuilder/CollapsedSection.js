import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import classNames from 'classnames';
import decodeDot from 'lib/helpers/decodeDot';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

class CollapsedSection extends Component {
  static propTypes = {
    used: PropTypes.bool,
    section: PropTypes.instanceOf(Map),
    onExpand: PropTypes.func,
  }

  shouldComponentUpdate = nextProps => !(
    this.props.section.equals(nextProps.section) &&
    this.props.used === nextProps.used
  );

  expandSection = (event) => {
    event.preventDefault();
    this.props.onExpand();
  }

  render = () => {
    const { section } = this.props;
    const title = decodeDot(section.get('title', ''));
    const containsCriteria = this.props.used;
    const classes = classNames(styles.collapsedSection, {
      [styles.usedCollapsedSection]: containsCriteria,
      [styles.unusedCollapsedSection]: !containsCriteria,
    });

    return (
      <a className={classes} onClick={this.expandSection}>
        <i className="ion-plus-circled" /> {title}
      </a>
    );
  }
}

export default withStyles(styles)(CollapsedSection);
