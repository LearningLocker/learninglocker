/* eslint-disable react/jsx-indent */
import React, { PropTypes } from 'react';
import { Map } from 'immutable';

const KeyValueIdent = ({ ident }) => {
  const value = ident.get('value');

  const renderedValue =
    typeof value === 'string' ? (
      <code>{value}</code>
    ) : (
      <pre>{JSON.stringify(value, null, 2)}</pre>
    );

  return (
    <dl className="dl-horizontal">
      <dt>{ident.get('key')}</dt>
      <dd>{renderedValue}</dd>
    </dl>
  );
};

KeyValueIdent.propTypes = {
  ident: PropTypes.instanceOf(Map)
};

export default KeyValueIdent;
