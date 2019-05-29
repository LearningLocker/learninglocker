import React from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import TemplateCard from './TemplateCard';
import BlankDashboard from './BlankDashboard';
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

      <TemplateCard title="Getting Started" onSelect={() => console.log('2')} />
    </div>
  </div>
);

export default withStyles(styles)(DashboardTemplates);
