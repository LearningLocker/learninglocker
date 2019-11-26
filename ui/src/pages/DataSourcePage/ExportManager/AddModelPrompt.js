import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AddModelPrompt extends Component {
  static propTypes = {
    onAdd: PropTypes.func,
    message: PropTypes.string,
  }

  static defaultProps = {
    onAdd: () => { }
  }

  render = () => {
    const { message } = this.props;

    return (
      <h4>
        {message}
        <a style={{ marginLeft: 8 }} onClick={this.props.onAdd}>
          <i className="ion ion-plus-circled" />
        </a>
      </h4>
    );
  }
}

export default AddModelPrompt;
