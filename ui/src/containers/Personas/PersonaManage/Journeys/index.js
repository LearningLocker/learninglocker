import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import styles from './styles.css';

const enhance = compose(
  withStyles(styles)
);

const journeyComponent = () => {
  console.log('001');
  return (<table className={styles.table}>
    <tr>
      <th className={styles.td}>Journey</th>
      <th className={styles.td}>Current Attempt</th>
      <th className={styles.td}>Completed</th>
    </tr>
  </table>);
};

export default enhance(journeyComponent);
