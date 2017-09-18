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

    // const itemId = item.get('_id');
    const uniqueIdent = model.get('uniqueIdentifier');
    const otherIdents = model.get('identifiers');

    const identifiers = otherIdents.map((ident, index) => {
      const value = ident.get('value');
      const renderedValue = typeof value === 'string' ? value : (
        <pre>{JSON.stringify(value, null, 2) }</pre>
      );
      return (
        <tr key={index}>
          <td>{ident.get('key')}</td>
          <td>{renderedValue}</td>
        </tr>
      );
    });

    return (
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>Unique identifier</h4>
        <KeyValueIdent ident={uniqueIdent} />
        <br />
        {(otherIdents.size > 0 &&
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>Scorable data</h4>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                { identifiers }
              </tbody>
            </table>
          </div>
        )}
        <hr />
      </div>
    );
  }

}
