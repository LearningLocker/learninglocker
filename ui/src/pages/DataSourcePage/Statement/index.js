import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import moment from 'moment';
import { displayActor, displayVerb, displayActivity } from '../../../utils/xapi';
import AutoUpdate from './AutoUpdate';
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

  renderPart = (path, part, displayer, filterPath) => {
    const filterValue = this.getInStatement(filterPath);
    const value = this.getInStatement(path);
    const display = displayer(value);
    const title = JSON.stringify(value.toJS(), null, 2);

    return (
      <a
        className={styles[part]}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          this.props.setFilterAt(filterPath, filterValue);
        }}
        title={title}>
        {display}
      </a>
    );
  }

  renderActor = (path, filterPath) =>
    this.renderPart(path, 'actor', displayActor, filterPath);

  renderVerb = path =>
    this.renderPart(path, 'verb', displayVerb, path);

  renderActivity = path =>
    this.renderPart(path, 'object', displayActivity, path);

  renderSubStatement = basePath =>
    <span>({this.renderStatement(basePath)})</span>;

  renderObject = (basePath, filterPath) => {
    const objectTypePath = basePath.concat(['objectType']);
    const objectType = this.getInStatement(objectTypePath);

    switch (objectType) {
      case 'SubStatement': return this.renderSubStatement(basePath);
      case 'StatementRef': return (<span>StatementRef</span>);
      case 'Agent':
      case 'Group': return this.renderActor(basePath, filterPath);
      default: return this.renderActivity(basePath);
    }
  }

  renderStatement = (basePath) => {
    const personPath = basePath.size === 1 && this.hasInStatement(new List(['person'])) ?
      new List(['person']) :
      undefined;

    const actorPath = basePath.concat(['actor']);
    const verbPath = basePath.concat(['verb']);
    const objectPath = basePath.concat(['object']);

    return (
      <span>
        {this.renderActor(actorPath, personPath || actorPath)}
        {' '}
        {this.renderVerb(verbPath)}
        {' '}
        {this.renderObject(objectPath, objectPath)}
      </span>
    );
  };

  render = () => {
    const timestamp = moment(this.getInStatement(new List(['statement', 'timestamp'])));

    return (
      <span>
        {this.renderStatement(new List(['statement']))}

        <AutoUpdate>
          <span className={`pull-right ${styles.timestamp}`}>
            {timestamp.fromNow()}
          </span>
        </AutoUpdate>
      </span>
    );
  };
}

export default withStyles(styles)(Statement);
