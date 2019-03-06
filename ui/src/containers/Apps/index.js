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
    title: 'Curatr',
    description: 'Curatr description of some sort.',
    icon: icons.curatr,
    icon2x: icons.curatr2x,
  },
  {
    link: 'https://github.com/xAPI-vle/moodle-logstore_xapi',
    title: 'Moodle',
    description: 'Moodle description of some sort.',
    icon: icons.moodle,
    icon2x: icons.moodle2x,
  },
];

const Apps = () => (
  <div className={styles.cardList}>
    {apps.map(app => <AppCard key={app.title} {...app} />)}
  </div>
);

export default withStyles(styles)(Apps);
