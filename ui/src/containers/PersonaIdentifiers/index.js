import React, { Component, PropTypes } from 'react';
import PersonaIdentifier from 'ui/components/PersonaIdentifier';
import { Map } from 'immutable';
import { compose, renameProp, withProps, setPropTypes } from 'recompose';
import { withSchema } from 'ui/utils/hocs';

const enhance = compose(
  setPropTypes({
    personaId: PropTypes.string,
    personaIdentifiers: PropTypes.instanceOf(Map),
  }),
  withProps(
    ({ personaId }) =>
    ({ filter: new Map({ persona: personaId }) })
  ),
  withSchema('personaIdentifier'),
  renameProp('models', 'personaIdentifiers')
);

class PersonaIdentifiers extends Component {
  renderItems = items => items.map((item) => {
    if (typeof item !== 'string') {
      return <PersonaIdentifier model={item} key={item.get('_id')} />;
    }
    return null;
  }).valueSeq();

  render = () => {
    const { personaIdentifiers } = this.props;

    return (
      <div>{this.renderItems(personaIdentifiers)}</div>
    );
  }
}

export default enhance(PersonaIdentifiers);
