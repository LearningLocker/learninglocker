import React, { Component, PropTypes } from 'react';
import { Map, List } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import moment from 'moment';
import AutoUpdate from 'ui/components/AutoUpdate';
import { displayActor, displayVerb, displayActivity } from '../../utils/xapi';
import styles from './styles.css';

class Statement extends Component {
  static propTypes = {
    statement: PropTypes.instanceOf(Map),
    setFilterAt: PropTypes.func,
  };

  getInStatement = path =>
    this.props.statement.getIn(path);

  hasInStatement = path =>
    this.props.statement.hasIn(path);

  setFilterAt = (keyPath, value, event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.setFilterAt(keyPath, value);
  }

  renderPart = (path, part, displayer, filterPath = path) => {
    const value = this.getInStatement(path);
    const filterValue = path === filterPath ? value : this.getInStatement(filterPath);
    const display = displayer(value);
    const title = JSON.stringify(value.toJS(), null, 2);
    const setFilter = this.setFilterAt.bind(null, filterPath, filterValue);

    return (
      <a
        className={styles[part]}
        onClick={setFilter}
        title={title}>
        {display}
      </a>
    );
  }

  renderActor = (path, filterPath) =>
    this.renderPart(path, 'actor', displayActor, filterPath);

  renderVerb = path =>
    this.renderPart(path, 'verb', displayVerb);

  renderActivity = path =>
    this.renderPart(path, 'object', displayActivity);

  renderStatement = basePath => (
    <span>
      {this.renderActor(basePath.concat(['actor']), (
        basePath.size === 1 && this.hasInStatement(new List(['person'])) ?
        new List(['person']) :
        basePath.concat(['actor'])
      ))}{' '}
      {this.renderVerb(basePath.concat(['verb']))}{' '}
      {this.renderObject(basePath.concat(['object']))}
    </span>
  );

  renderSubStatement = basePath =>
    <span>({this.renderStatement(basePath)})</span>;

  renderStatementRef = () =>
    <span>StatementRef</span>;

  renderObject = (basePath) => {
    const objectTypePath = basePath.concat(['objectType']);
    const objectType = this.getInStatement(objectTypePath);
    switch (objectType) {
      case 'SubStatement': return this.renderSubStatement(basePath);
      case 'StatementRef': return this.renderStatementRef(basePath);
      case 'Agent':
      case 'Group': return this.renderActor(basePath);
      default: return this.renderActivity(basePath);
    }
  }

  renderTimestamp = (basePath) => {
    const timestampPath = basePath.concat(['timestamp']);
    const timestamp = moment(this.getInStatement(timestampPath));
    return (
      <AutoUpdate>
        <span className={`pull-right ${styles.timestamp}`}>
          {timestamp.fromNow()}
        </span>
      </AutoUpdate>
    );
  }

  render = () => {
    const basePath = new List(['statement']);

    return (
      <span>
        {this.renderTimestamp(basePath)}
        {this.renderStatement(basePath)}
      </span>
    );
  };
}

export default withStyles(styles)(Statement);
