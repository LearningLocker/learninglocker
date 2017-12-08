import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { compose, setPropTypes } from 'recompose';
import IfiAccountViewer from './IfiAccountViewer';

const enhance = compose(
  setPropTypes({
    identifierType: PropTypes.string.isRequired,
    identifierValue: PropTypes.oneOf([
      PropTypes.string,
      PropTypes.instanceOf(Map),
    ]).isRequired,
  })
);

const render = ({ identifierType, identifierValue }) => {
  if (identifierType === 'account') {
    return <IfiAccountViewer identifierValue={identifierValue} />;
  } else {
    return <span>{identifierValue}</span>;
  }
};

export default enhance(render);