/* eslint-disable react/jsx-indent */
import React, { PropTypes } from 'react';
import { Map } from 'immutable';

const KeyValueIdent = ({ ident }) => {
  const value = ident.get('value');

  const renderedValue = typeof value === 'string' ? (<code>{value}</code>) : (
    <pre>{JSON.stringify(value, null, 2) }</pre>
  );

  return (
    <div>
      <div><strong>Field:</strong> <code>{ ident.get('key') }</code></div>
      <div><strong>Value: </strong>{ renderedValue }</div>
    </div>
  );
};

KeyValueIdent.propTypes = {
  ident: PropTypes.instanceOf(Map),
};

export default KeyValueIdent;
