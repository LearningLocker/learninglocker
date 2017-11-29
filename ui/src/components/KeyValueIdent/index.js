/* eslint-disable react/jsx-indent */
import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import DeleteButton from 'ui/containers/DeleteButton';

const KeyValueIdent = ({ ident, id, schema }) => {
  const value = ident.get('value');

  const renderedValue =
    typeof value === 'string' ? (
      <code>{value}</code>
    ) : (
      <pre>{JSON.stringify(value, null, 2)}</pre>
    );

  return (
    <dl className="dl-horizontal clearfix">
      <dt>{ident.get('key')}</dt>
      <dd>
        {renderedValue}
        <DeleteButton schema={schema} id={id} className="pull-right" small />
      </dd>
    </dl>
  );
};

KeyValueIdent.propTypes = {
  ident: PropTypes.instanceOf(Map)
};

export default KeyValueIdent;
