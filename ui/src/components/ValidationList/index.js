import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

class ValidationList extends Component {
  static propTypes = {
    errors: PropTypes.instanceOf(List)
  }

  static defaultProps = {
    errors: new List()
  };

  render = () => {
    const { errors } = this.props;

    return (
      <div>
        <ul>
          { errors.map((error, index) =>
            <li key={index}>{error}</li>
            ).valueSeq()
          }
        </ul>
      </div>
    );
  }
}

export default ValidationList;
