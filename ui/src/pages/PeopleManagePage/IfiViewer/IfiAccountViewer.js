import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { compose, setPropTypes } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

const enhance = compose(
  setPropTypes({
    identifierValue: PropTypes.instanceOf(Map).isRequired,
  }),
  withStyles(styles)
);

const render = ({ identifierValue }) => {
  const homePage = identifierValue.get('homePage');
  const name = identifierValue.get('name');
  return (
    <div>
      <div>
        <span className={styles.key}>Website: </span>
        <span className={styles.value}>{homePage}</span>
      </div>
      <div>
        <span className={styles.key}>User ID: </span>
        <span className={styles.value}>{name}</span>
      </div>
    </div>
  );
};

export default enhance(render);
