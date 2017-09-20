import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import Avatar from 'react-toolbox/lib/avatar';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { omitBy, isFunction } from 'lodash';
import styles from './styles.css';

const enhance = withStyles(styles);

class UserPicture extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    className: PropTypes.string
  }
  static defaultProps = {
    model: new Map(),
    className: ''
  }

  render = () => {
    const { model, className, ...others } = this.props;
    let name = model.get('name');
    if (!name || name === '') name = model.get('email', '');
    const modelProps = {
      className,
      title: name,
      ...others,
      theme: omitBy(styles, isFunction),
      size: 30,
    };

    if (model.has('imageUrl')) return <Avatar src={model.get('imageUrl')} {...modelProps} />;
    return <Avatar {...modelProps} />;
  }
}

export default enhance(UserPicture);
