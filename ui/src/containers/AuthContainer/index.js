import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { fetchModels } from 'ui/redux/modules/pagination';
import { loggedInUserId, loggedInUserSelector } from 'ui/redux/modules/auth';
import { Map } from 'immutable';

class AuthContainer extends Component {
  static propTypes = {
    userId: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    user: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
    children: PropTypes.node,
    fetchModels: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  };

  static defaultProps = {
    user: new Map()
  }

  componentDidMount = () => {
    this._getAuthUser(this.props);
  }

  componentWillReceiveProps = (nextProps) => {
    this._getAuthUser(nextProps);
  }

  _getAuthUser = (props) => {
    // if we haven't populated the user
    // then its probably because it doesn't exist in the state
    // or there is no userId (unauthed)
    if (props.user.isEmpty() && props.userId) {
      // go fetch with a query
      props.fetchModels({ schema: 'user', filter: new Map({ _id: props.userId }) });
    }
  }

  render() {
    return (<div>{ this.props.children }</div>);
  }
}

export default connect(state => ({
  userId: loggedInUserId(state),
  user: loggedInUserSelector(state)
}), { fetchModels })(AuthContainer);
