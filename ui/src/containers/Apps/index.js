import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import AppCard from './AppCard';
import styles from './styles.css';
import icons from './icons';

const apps = [
  {
    link: 'https://withsparks.com/',
    title: 'Sparks',
    description: 'Use statements to trigger follow on actions, deliver personalized feedback and automate workflow.',
    icon: icons.sparks,
    icon2x: icons.sparks2x,
  },
  {
    link: 'https://ht2ltd.zendesk.com/hc/en-us/articles/208166165-xAPI-in-Curatr',
    title: 'Curatr LXP',
    description: 'Cutting edge Learning experience platform that is designed to work hand-in-hand with Learning Locker.',
    icon: icons.curatr,
    icon2x: icons.curatr2x,
  },
  {
    link: 'https://github.com/xAPI-vle/moodle-logstore_xapi',
    title: 'Moodle',
    description: 'Widely supported open source learning platform supported by a custom xAPI plugin.',
    icon: icons.moodle,
    icon2x: icons.moodle2x,
  },
];

const Apps = () => (
  <div>
    <header id="topbar">
      <div className="heading heading-light">
        Apps
      </div>
    </header>
    <div className={styles.cardList}>
      {apps.map(app => <AppCard key={app.title} {...app} />)}
    </div>
  </div>
);

export default withStyles(styles)(Apps);
