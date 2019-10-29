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
  {
    link: 'https://www.ht2labs.com/apps/semantic-analysis/',
    title: 'Semantic Analysis',
    description: 'Use our proprietary algorithm to drive insights into the quality of learners\' submissions.',
    icon: icons.semanticAnalysis,
  },
  {
    link: 'https://www.ht2labs.com/apps/bi-connector/',
    title: 'BI Connector',
    description: 'Feed your BI tool with real-time data from Learning Locker®.',
    icon: icons.biConnector,
  },
  {
    link: 'https://www.ht2labs.com/apps/survey-monkey/',
    title: 'Survey Monkey',
    description: 'Capture learner feedback from outside of the LMS',
    icon: icons.surveyMonkey,
  },
  {
    link: 'https://www.ht2labs.com/apps/getabstract/',
    title: 'getAbstract',
    description: 'Summarize text from thousands of sources',
    icon: icons.getAbstract,
  },
  {
    link: 'https://www.ht2labs.com/apps/degreed/',
    title: 'Degreed',
    description: 'API integration with one of the largest off the shelf learning platforms',
    icon: icons.degreed,
  },
  {
    link: 'https://www.ht2labs.com/apps/cornerstone-on-demand/',
    title: 'Cornerstone On Demand',
    description: 'One of the most widely used LMSs on the market.',
    icon: icons.cornerstoneOnDemand,
  },
  {
    link: 'https://www.ht2labs.com/apps/google-forms/',
    title: 'Google Forms',
    description: 'Generate xAPI data from your Google forms responses',
    icon: icons.googleForms,
  },
  {
    link: 'https://www.ht2labs.com/apps/yammer/',
    title: 'Yammer',
    description: 'Convert conversation data into xAPI statements',
    icon: icons.yammer,
  },
  {
    link: 'https://www.ht2labs.com/apps/skillsoft/',
    title: 'SkillSoft',
    description: 'One of the most widely used off-the-shelf content providers in the world',
    icon: icons.skillsoft,
  },
  {
    link: 'https://www.ht2labs.com/apps/url-shortener/',
    title: 'URL Shortener',
    description: 'Create simple, shareable URLs',
    icon: icons.urlShortener,
  },
  {
    link: 'https://www.ht2labs.com/apps/csv-to-xapi/',
    title: 'CSV to xAPI',
    description: 'Convert spreadsheet data into xAPI statements',
    icon: icons.csvToXAPI,
  },
  {
    link: 'https://www.ht2labs.com/apps/launchr/',
    title: 'Launchr',
    description: 'Securely launch xAPI content packages',
    icon: icons.launchr,
  },
  {
    link: 'https://www.ht2labs.com/apps/gdpr/',
    title: 'GDPR',
    description: 'A central administration tool for organizations seeking to comply with GDPR',
    icon: icons.gdpr,
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
