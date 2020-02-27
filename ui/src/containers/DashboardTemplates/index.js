import React from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import BlankDashboard from './BlankDashboard';
import CuratrStarter from './CuratrStarter';
import GettingStarted from './GettingStarted';
import styles from './styles.css';

const DashboardTemplates = ({ handleClose }) => (
  <div className={classNames(styles.panel, 'panel panel-default')}>

    <div className={styles.dashboardCreateTitle}>
      <label htmlFor="dashboard-templates">
        Add Dashboard
      </label>
      <div
        className={styles.dashboardClose}
        onClick={handleClose}>
        <i className="ion-close-round" />
      </div>
    </div>
    <p>
      Start by selecting a blank dashboard or choose a template
    </p>

    <div
      id="dashboard-templates"
      className={styles.cardList}>

      <BlankDashboard />
      <GettingStarted />
      <CuratrStarter />
    </div>
  </div>
);

export default withStyles(styles)(DashboardTemplates);
