import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { compose, setPropTypes } from 'recompose';
import styled from 'styled-components';

const Key = styled.span`
  font-weight: bold;
`;

const enhance = compose(
  setPropTypes({
    identifierValue: PropTypes.instanceOf(Map).isRequired,
  })
);

const render = ({ identifierValue }) => {
  const homePage = identifierValue.get('homePage');
  const name = identifierValue.get('name');
  return (
    <div>
      <div>
        <Key>Website: </Key>
        <span>{homePage}</span>
      </div>
      <div>
        <Key>User ID: </Key>
        <span>{name}</span>
      </div>
    </div>
  );
};

export default enhance(render);
