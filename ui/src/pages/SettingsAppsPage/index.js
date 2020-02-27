import React from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import Link from 'ui/containers/Link';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import AppCard from './AppCard';
import styles from './styles.css';
import icons from './icons';

function LinkAppCard(props) {
  return (
    <Link className={styles.cardA} routeName={props.routeName} routeParams={props.organisationId}>
      <AppCard title={props.title} description={props.description} icon={props.icon} />
    </Link>
  );
}

function HrefAppCard(props) {
  return (
    <a className={styles.cardA} href={props.hrefLink} target="_blank" rel="noopener noreferrer">
      <AppCard title={props.title} description={props.description} icon={props.icon} icon2x={props.icon2x} />
    </a>
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
      <HrefAppCard
        hrefLink="https://withsparks.com/"
        title="Sparks"
        description="Use statements to trigger follow on actions, deliver personalized feedback and automate workflow."
        icon={icons.sparks}
        icon2x={icons.sparks2x} />
      <HrefAppCard
        hrefLink="https://ht2ltd.zendesk.com/hc/en-us/articles/208166165-xAPI-in-Curatr"
        title={'Stream'}
        description="Cutting edge Learning experience platform that is designed to work hand-in-hand with Learning Locker."
        icon={icons.stream}
        icon2x={icons.stream2x} />
      <HrefAppCard
        hrefLink="https://github.com/xAPI-vle/moodle-logstore_xapi"
        title="Moodle"
        description="Widely supported open source learning platform supported by a custom xAPI plugin."
        icon={icons.moodle}
        icon2x={icons.moodle2x} />
      <HrefAppCard
        hrefLink="https://www.ht2labs.com/apps/semantic-analysis/"
        title="Semantic Analysis"
        description="Use our proprietary algorithm to drive insights into the quality of learners' submissions."
        icon={icons.semanticAnalysis} />
      <HrefAppCard
        hrefLink="https://www.ht2labs.com/apps/bi-connector/"
        title="BI Connector"
        description="Feed your BI tool with real-time data from Learning Locker®."
        icon={icons.biConnector} />
      <HrefAppCard
        hrefLink="https://www.ht2labs.com/apps/survey-monkey/"
        title="Survey Monkey"
        description="Capture learner feedback from outside of the LMS"
        icon={icons.surveyMonkey} />
      <HrefAppCard
        hrefLink="https://www.ht2labs.com/apps/getabstract/"
        title="getAbstract"
        description="Summarize text from thousands of sources"
        icon={icons.getAbstract} />
      <HrefAppCard
        hrefLink="https://www.ht2labs.com/apps/degreed/"
        title="Degreed"
        description="API integration with one of the largest off the shelf learning platforms"
        icon={icons.degreed} />
      <HrefAppCard
        hrefLink="https://www.ht2labs.com/apps/cornerstone-on-demand/"
        title="Cornerstone On Demand"
        description="One of the most widely used LMSs on the market."
        icon={icons.cornerstoneOnDemand} />
      <HrefAppCard
        hrefLink="https://www.ht2labs.com/apps/google-forms/"
        title="Google Forms"
        description="Generate xAPI data from your Google forms responses"
        icon={icons.googleForms} />
      <HrefAppCard
        hrefLink="https://www.ht2labs.com/apps/yammer/"
        title="Yammer"
        description="Convert conversation data into xAPI statements"
        icon={icons.yammer} />
      <HrefAppCard
        hrefLink="https://www.ht2labs.com/apps/skillsoft/"
        title="SkillSoft"
        description="One of the most widely used off-the-shelf content providers in the world"
        icon={icons.skillsoft} />
      <HrefAppCard
        hrefLink="https://www.ht2labs.com/apps/url-shortener/"
        title="URL Shortener"
        description="Create simple shareable URLs"
        icon={icons.urlShortener} />
      <HrefAppCard
        hrefLink="https://www.ht2labs.com/apps/csv-to-xapi/"
        title="CSV to xAPI"
        description="Convert spreadsheet data into xAPI statements"
        icon={icons.csvToXAPI} />
      <HrefAppCard
        hrefLink="https://www.ht2labs.com/apps/launchr/"
        title="Launchr"
        description="Securely launch xAPI content packages"
        icon={icons.launchr} />
      <HrefAppCard
        hrefLink="https://www.ht2labs.com/apps/gdpr/"
        title="GDPR"
        description="A central administration tool for organizations seeking to comply with GDPR"
        icon={icons.gdpr} />
      <LinkAppCard
        organisationId={{ organisationId }}
        routeName="organisation.apps.salesDemo"
        title="Sales Demo"
        description="Creates demo sales performance data and a complete dashboard"
        icon={icons.salesDemo} />
    </div>
  </div>
);

export default compose(
  withStyles(styles),
  connect(state => ({
    organisationId: activeOrgIdSelector(state),
  })),
)(Apps);
