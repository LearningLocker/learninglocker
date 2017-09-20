import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { actions, routeNodeSelector } from 'redux-router5';
import { getContext, compose } from 'recompose';
import { includesSegment } from 'router5.helpers';
import classNames from 'classnames';

const link = ({
  routeName,
  routeParams = {},
  routeOptions = {},
  router,
  navigateTo,
  className,
  activeClassName = 'active',
  children,
  activeRoute,
  onClick,
  isActive,
  style
}) => {
  const href = router.buildUrl(routeName, routeParams);

  const handleClick = (evt) => {
    if (onClick) {
      onClick(evt);
    } else {
      evt.preventDefault();
      navigateTo(routeName, routeParams, routeOptions);
    }
  };

  const finalIsActive =
    isActive || includesSegment(activeRoute.name, routeName);
  const classes = classNames(className, {
    [activeClassName]: finalIsActive
  });

  return (
    <a href={href} style={style} onClick={handleClick} className={classes}>
      {children}
    </a>
  );
};

link.propTypes = {
  routeName: PropTypes.string.isRequired,
  routeParams: PropTypes.object,
  routeOptions: PropTypes.object,
  navigateTo: PropTypes.func.isRequired
};

export default compose(
  getContext({
    router: PropTypes.object
  }),
  connect(
    (state, { routeName }) => ({
      activeRoute: routeNodeSelector(routeName)(state).route
    }),
    {
      navigateTo: actions.navigateTo
    }
  )
)(link);
