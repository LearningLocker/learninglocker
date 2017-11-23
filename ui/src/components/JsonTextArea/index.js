import React, { Component, PropTypes } from 'react';
import { Map, fromJS } from 'immutable';
import Textarea from 'react-textarea-autosize';
import classNames from 'classnames';
import {
  debounce,
  assign,
} from 'lodash';
import { cursorPosition } from 'lib/helpers/textCursor';

const stateFromProps = ({
  value,
}) => ({
  value: JSON.stringify(value.toJS(), null, 2),
  error: null,
});


export default class JsonTextArea extends Component {

  static propTypes = {
    value: PropTypes.instanceOf(Map), // eslint-disable-line react/no-unused-prop-types
    onChange: PropTypes.func,
    setReviver: PropTypes.func,
  }

  static defaultProps = {
    value: new Map(),
    onChange: () => {}
  }

  constructor(props) {
    super(props);
    this.state = stateFromProps(props);
  }

  componentWillReceiveProps = (nextProps) => {
    const oldValue = this.state.value;
    const stateWithValue = stateFromProps(nextProps);
    const selectionStart = cursorPosition({
      oldCursorPosition: this.textarea._rootDOMNode.selectionStart,
      oldValue,
      newValue: stateWithValue.value,
    });

    const selectionDifference =
      this.textarea._rootDOMNode.selectionEnd -
        this.textarea._rootDOMNode.selectionStart;

    const stateWithCursor = {
      selectionStart,
      selectionEnd: selectionStart + selectionDifference,
    };

    const newState = assign(
      {},
      stateWithValue,
      stateWithCursor
    );
    this.setState(newState);
  }

  componentDidUpdate = () => {
    const {
      selectionStart,
      selectionEnd
    } = this.state;

    this.textarea._rootDOMNode.selectionStart = selectionStart;
    this.textarea._rootDOMNode.selectionEnd = selectionEnd;
  }

  textarea = null

  onChange = debounce((immutQuery) => {
    this.props.onChange(immutQuery);
  }, 620);

  handleChange = (e) => {
    const { setReviver } = this.props;
    const newState = {
      oldValue: this.state.value,
      value: e.target.value,
      selectionStart: e.target.selectionStart,
      selectionEnd: e.target.selectionEnd,
    };

    try {
      const newQuery = JSON.parse(newState.value);
      const immutQuery = fromJS(newQuery, setReviver);
      this.onChange(immutQuery);
      newState.error = null;
    } catch (err) {
      this.onChange.cancel();
      newState.error = err;
    }
    this.setState(newState);
  }

  render = () => {
    const { value, error } = this.state;
    const formClasses = classNames({
      'form-group': true,
      'has-error': error
    });

    return (
      <div className={formClasses}>
        <Textarea
          onChange={this.handleChange}
          value={value}
          className="form-control"
          ref={(ref) => { (this.textarea = ref); }} />
        {error &&
          <span className="help-block">{error.message}</span>
        }
      </div>
    );
  }
}
