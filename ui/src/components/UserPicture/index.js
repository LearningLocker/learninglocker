import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import Avatar from 'react-toolbox/lib/avatar';
import styled from 'styled-components';

const letterClassName = 'letter';

const StyledAvatar = styled(Avatar)`
  && {
    width: 30px;
    height: 30px;
    font-size: 2.1rem;
    margin-top: -5px;
    margin-right: 20px;

    .${letterClassName} {
      line-height: 30px;
    }
  }
`;

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
      theme: {
        letter: letterClassName,
      },
      size: 30,
      ...others,
    };

    if (model.has('imageUrl')) {
      return <StyledAvatar src={model.get('imageUrl')} {...modelProps} />;
    }

    return <StyledAvatar {...modelProps} />;
  };
}

export default UserPicture;
