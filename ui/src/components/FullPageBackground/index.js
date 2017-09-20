import React, { PropTypes } from 'react';
import logoImg from 'ui/static/logo.png';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { setPropTypes, compose, lifecycle } from 'recompose';
import { connect } from 'react-redux';
import { getAppDataSelector, fetchAppData } from 'ui/redux/modules/app';
import styles from './styles.css';

const enhance = compose(
  setPropTypes({
    children: PropTypes.node
  }),
  connect(state => ({
    version: getAppDataSelector('version')(state),
  }), { fetchAppData }),
  lifecycle({
    componentWillMount() {
      this.props.fetchAppData({ key: 'version' });
    },
  }),
  withStyles(styles)
);

const versionDisplay = (version) => {
  if (!version.has('tag')) {
    return <p className={styles.version}>Loading version...</p>;
  }
  const tag = version.get('tag');
  const branch = version.get('branch');
  const long = version.get('long');
  const short = version.get('short');

  const longDisplay = `Build: ${branch} @ ${long}`;
  const shortDisplay = `Build: ${branch} @ ${short}`;

  const display = (branch === 'master' || branch === 'HEAD') ? tag : shortDisplay;
  return <p className={styles.version} title={longDisplay}>{ display }</p>;
};

const FullPageBackground = ({ version, children, width = 600 }) => (
  <div className={styles.background}>
    <div className={styles.centered}>
      <img alt="logo" src={logoImg} className={styles.logoImg} />
      <span className={styles.headline}>making learning measurable</span>
      <div className={styles.underline} />
      <div style={{ width }}>
        { children }
      </div>
      <p className={styles.copyright}>&copy; {new Date().getFullYear()} HT2 Labs</p>
      { versionDisplay(version) }
    </div>
  </div>
);

export default enhance(FullPageBackground);
