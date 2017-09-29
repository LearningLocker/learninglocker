import React, { PropTypes, Component } from 'react';
import { routeNodeSelector } from 'redux-router5';
import { VelocityComponent } from 'velocity-react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import Link from 'ui/containers/Link';
import { includesSegment } from 'router5.helpers';
import styles from './sidenav.css';

class CollapsibleNav extends Component {
  static propTypes = {
    icon: PropTypes.string,
    label: PropTypes.string,
    children: PropTypes.node,
    routeName: PropTypes.string,
    routeParams: PropTypes.object,
    activeRoute: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      bodyHeight: 0
    };
  }

  setBodyHeight = () => {
    if (this.bodyDom) {
      this.setState({
        bodyHeight: this.bodyDom.clientHeight
      });
    }
  }

  saveBodyRef = (ref) => {
    this.bodyDom = ref;
    this.setBodyHeight();
  }
  onClick = (e) => {
    e.preventDefault();
    const { onClick, routeName } = this.props;
    onClick(routeName);
  }

  animationComplete = isExpanded => () => {
    if (isExpanded) {
      this.bodyDom.style.height = 'auto';
    }
  }

  render = () => {
    const { bodyHeight } = this.state;
    const {
      children,
      label,
      icon,
      routeName,
      routeParams,
      activeRoute,
      manuallyExpanded
    } = this.props;
    const isExpanded = includesSegment(activeRoute.name, routeName) || manuallyExpanded;

    const animationProps = isExpanded ? {
      height: [bodyHeight, [100, 14]],
    } : {
      height: [0, [100, 14]],
    };

    return (
      <li>
        <Link
          routeName={routeName}
          routeParams={routeParams}
          activeClassName={`${styles.vLinkActive} ${styles.active}`}
          isActive={isExpanded}
          onClick={this.onClick}>
          <i className={icon} /> {label}
        </Link>

        <VelocityComponent
          animation={animationProps}
          duration={350}
          complete={this.animationComplete(isExpanded)} >
          <ul
            className={`nav animated fadeIn ${styles.subNav}`}
            ref={this.saveBodyRef}
            style={{ overflow: 'hidden' }}>
            {children}
          </ul>
        </VelocityComponent>
      </li>
    );
  }
}

export default compose(
  withStyles(styles),
  connect((state, { routeName }) => ({
    activeRoute: routeNodeSelector(routeName)(state).route
  }))
)(CollapsibleNav);
