import React from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import BlankDashboard from './BlankDashboard';
import GettingStarted from './GettingStarted';
import styles from './styles.css';

const DashboardTemplates = () => (
  <div className={classNames(styles.panel, 'panel panel-default')}>

    <label htmlFor="dashboard-templates">
      Custom Templates
    </label>

    <div
      id="dashboard-templates"
      className={styles.cardList}>

      <BlankDashboard />
      <GettingStarted />
    </div>
  </div>
);

export default withStyles(styles)(DashboardTemplates);
