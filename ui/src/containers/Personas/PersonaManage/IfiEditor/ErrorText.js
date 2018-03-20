import React, { PropTypes } from 'react';
import { compose, setPropTypes } from 'recompose';

const enhance = compose(
  setPropTypes({
    hasError: PropTypes.bool.isRequired,
    children: PropTypes.element.isRequired,
  })
);

const render = ({ hasError, children }) => {
  if (hasError) {
    return <span className="help-block">{children}</span>;
  }
  return <noscript />;
};

export default enhance(render);
