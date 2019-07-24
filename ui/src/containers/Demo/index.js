import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import AppCard from './AppCard';
import styles from './styles.css';
import icons from './icons';

const apps = [
  {
    link: 'https://www.ht2labs.com/apps/',
    title: 'Sales Demo',
    description: 'Provides example data to demo how Learning Locker works',
    icon: icons.gdpr,
  },
];

const Apps = () => {
  const out = (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
          Demo
        </div>
      </header>
      <div className={styles.cardList}>
        {apps.map(app => <AppCard key={app.title} {...app} />)}
      </div>
    </div>
  );
  return out;
}

export default withStyles(styles)(Apps);
