/* eslint-disable react/jsx-indent */
import React, { Component, PropTypes } from 'react';
import KeyValueIdent from 'ui/components/KeyValueIdent';
import { Map } from 'immutable';

export default class PersonaIdentifier extends Component {
  static propTypes = {
    model: PropTypes.object
  }

  static defaultProps = {
    model: new Map()
  }

  render = () => {
    const { model } = this.props;

    const uniqueIdent = model.get('ifi');

    return (
      <div>
        <KeyValueIdent
          ident={uniqueIdent} />
      </div>
    );
  }

}
