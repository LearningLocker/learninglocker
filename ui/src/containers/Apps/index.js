import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import AppCard from './AppCard';
import styles from './styles.css';
import icons from './icons';
import Link from '../Link';

function hrefAppCard(hrefLink, title, description, icon, icon2x) {
  return (
    <a className={styles.cardA} href={hrefLink} target="_blank" rel="noopener noreferrer">
      <AppCard title={title} description={description} icon={icon} icon2x={icon2x} />
    </a>
  );
}

function linkAppCard(organisationId, routeName, title, description, icon) {
  return (
    <Link className={styles.cardA} routeName={routeName} routeParams={{ organisationId }}>
      <AppCard title={title} description={description} icon={icon} />
    </Link>
  );
}

const Apps = ({ organisationId }) => (
  <div>
    <header id="topbar">
      <div className="heading heading-light">
        Apps
      </div>
    </header>
    <div className={styles.cardList}>
      {hrefAppCard(
        'https://withsparks.com/',
        'Sparks',
        'Use statements to trigger follow on actions, deliver personalized feedback and automate workflow.',
        icons.sparks,
        icons.sparks2x,
      )}
      {hrefAppCard(
        'https://ht2ltd.zendesk.com/hc/en-us/articles/208166165-xAPI-in-Curatr',
        'Curatr LXP',
        'Cutting edge Learning experience platform that is designed to work hand-in-hand with Learning Locker.',
        icons.curatr,
        icons.curatr2x,
      )}
      {hrefAppCard(
        'https://github.com/xAPI-vle/moodle-logstore_xapi',
        'Moodle',
        'Widely supported open source learning platform supported by a custom xAPI plugin.',
        icons.moodle,
        icons.moodle2x,
      )}
      {hrefAppCard(
        'https://www.ht2labs.com/apps/semantic-analysis/',
        'Semantic Analysis',
        'Use our proprietary algorithm to drive insights into the quality of learners\' submissions.',
        icons.semanticAnalysis
      )}
      {hrefAppCard(
        'https://www.ht2labs.com/apps/bi-connector/',
        'BI Connector',
        'Feed your BI tool with real-time data from Learning Locker®.',
        icons.biConnector
      )}
      {hrefAppCard(
        'https://www.ht2labs.com/apps/survey-monkey/',
        'Survey Monkey',
        'Capture learner feedback from outside of the LMS',
        icons.surveyMonkey
      )}
      {hrefAppCard(
        'https://www.ht2labs.com/apps/getabstract/',
        'getAbstract',
        'Summarize text from thousands of sources',
        icons.getAbstract
      )}
      {hrefAppCard(
        'https://www.ht2labs.com/apps/degreed/',
        'Degreed',
        'API integration with one of the largest off the shelf learning platforms',
        icons.degreed
      )}
      {hrefAppCard(
        'https://www.ht2labs.com/apps/cornerstone-on-demand/',
        'Cornerstone On Demand',
        'One of the most widely used LMSs on the market.',
        icons.cornerstoneOnDemand
      )}
      {hrefAppCard(
        'https://www.ht2labs.com/apps/google-forms/',
        'Google Forms',
        'Generate xAPI data from your Google forms responses',
        icons.googleForms
      )}
      {hrefAppCard(
        'https://www.ht2labs.com/apps/yammer/',
        'Yammer',
        'Convert conversation data into xAPI statements',
        icons.yammer
      )}
      {hrefAppCard(
        'https://www.ht2labs.com/apps/skillsoft/',
        'SkillSoft',
        'One of the most widely used off-the-shelf content providers in the world',
        icons.skillsoft
      )}
      {hrefAppCard(
        'https://www.ht2labs.com/apps/url-shortener/',
        'URL Shortener',
        'Create simple, shareable URLs',
        icons.urlShortener
      )}
      {hrefAppCard(
        'https://www.ht2labs.com/apps/csv-to-xapi/',
        'CSV to xAPI',
        'Convert spreadsheet data into xAPI statements',
        icons.csvToXAPI
      )}
      {hrefAppCard(
        'https://www.ht2labs.com/apps/launchr/',
        'Launchr',
        'Securely launch xAPI content packages',
        icons.launchr
      )}
      {hrefAppCard(
        'https://www.ht2labs.com/apps/gdpr/',
        'GDPR',
        'A central administration tool for organizations seeking to comply with GDPR',
        icons.gdpr
      )}
      {linkAppCard(
        organisationId,
        'organisation.demo',
        'Sales Demo',
        'Provides example data to demo how Learning Locker works',
        icons.gdpr
      )}
    </div>
  </div>
);

export default compose(
  withStyles(styles),
  connect(state => ({
    organisationId: activeOrgIdSelector(state),
  })),
)(Apps);
