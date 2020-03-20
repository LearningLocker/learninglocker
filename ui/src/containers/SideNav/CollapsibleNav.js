import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { routeNodeSelector } from 'redux-router5';
import { VelocityComponent } from 'velocity-react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { includesSegment } from 'router5.helpers';
import Link from 'ui/containers/Link';
import { activeLinkClassName, SubNav } from 'ui/containers/SideNav/styled';

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
          activeClassName={`${activeLinkClassName}`}
          isActive={isExpanded}
          onClick={this.onClick}>
          <i className={icon} /> {label}
        </Link>

        <VelocityComponent
          animation={animationProps}
          duration={350}
          complete={this.animationComplete(isExpanded)} >
          <SubNav
            className={'nav animated fadeIn'}
            ref={this.saveBodyRef}
            style={{ overflow: 'hidden' }}>
            {children}
          </SubNav>
        </VelocityComponent>
      </li>
    );
  }
}

export default compose(
  connect((state, { routeName }) => ({
    activeRoute: routeNodeSelector(routeName)(state).route
  }))
)(CollapsibleNav);
