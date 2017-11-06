import React, { PropTypes } from 'react';
// import PersonaAttribute from 'ui/components/PersonaAttribute';
import { Map } from 'immutable';
import { compose, renameProp, withProps, setPropTypes } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import KeyValueIdent from 'ui/components/KeyValueIdent';

const enhance = compose(
  setPropTypes({
    personaId: PropTypes.string,
    attributes: PropTypes.instanceOf(Map),
  }),
  withProps(
    ({ personaId }) =>
      ({
        filter: new Map({ personaId }),
        schema: 'personaAttribute',
      }),
  ),
  withModels,
  renameProp('models', 'attributes')
);

const renderItems = items => items.map((item) => {
  if (typeof item !== 'string') {
    return (<div>
      <KeyValueIdent
        ident={item} />
    </div>);
  }
  return null;
}).valueSeq();

const personaAttributes = ({
  attributes
}) => (<div>{renderItems(attributes)}</div>);

export default enhance(personaAttributes);
