import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import moment from 'moment';
import styled from 'styled-components';
import { ActivityPart } from './ActivityPart';
import { ActorPart } from './ActorPart';
import AutoUpdate from './AutoUpdate';
import { VerbPart } from './VerbPart';

const Timestamp = styled.span`
  font-weight: normal;
`;

class Statement extends Component {
  static propTypes = {
    statement: PropTypes.instanceOf(Map),
    setFilterAt: PropTypes.func,
  };

  getInStatement = path =>
    this.props.statement.getIn(path);

  hasInStatement = path =>
    this.props.statement.hasIn(path);

  renderActor = (path, filterPath) => {
    const filterValue = this.getInStatement(filterPath);
    const value = this.getInStatement(path);
    return (
      <ActorPart value={value} onSetFilter={() => this.props.setFilterAt(filterPath, filterValue)} />
    );
  }

  renderVerb = (path) => {
    const value = this.getInStatement(path);
    return (
      <VerbPart value={value} onSetFilter={() => this.props.setFilterAt(path, value)} />
    );
  }

  renderActivity = (path) => {
    const value = this.getInStatement(path);
    return (
      <ActivityPart value={value} onSetFilter={() => this.props.setFilterAt(path, value)} />
    );
  }

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
          <Timestamp className="pull-right">
            {timestamp.fromNow()}
          </Timestamp>
        </AutoUpdate>
      </span>
    );
  };
}

export default Statement;
