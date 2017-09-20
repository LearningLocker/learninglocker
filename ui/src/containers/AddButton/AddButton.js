import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { addModel } from 'ui/redux/modules/models';
import { withModel } from 'ui/utils/hocs';
import { compose } from 'recompose';
import { Map } from 'immutable';
import classNames from 'classnames';

class AddButton extends Component {
  static propTypes = {
    schema: PropTypes.string,
    addModel: PropTypes.func,
    data: PropTypes.instanceOf(Map),
    white: PropTypes.bool,
    onAddedModel: PropTypes.func,
  }

  static defaultProps = {
    onAddedModel: () => null,
  }

  onAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { schema, data } = this.props;
    const { clientId } = this.props.addModel(schema, data.toJS());
    this.props.onAddedModel(clientId);
  }

  render = () => {
    const classes = classNames({
      'btn-sm btn': true,
      'btn-inverse': !this.props.white,
      'btn-default flat-white flat-btn': this.props.white,
    });
    return (
      <button
        className={classes}
        onClick={this.onAdd}
        style={{ width: '33px' }}>
        <span><i className="fa fa-plus" /></span>
      </button>
    );
  }
}

export default compose(
  withModel,
  connect(() => {}, { addModel })
)(AddButton);
