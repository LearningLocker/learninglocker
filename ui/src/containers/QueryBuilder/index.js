/* eslint-disable react/jsx-indent */
import React, { Component, PropTypes } from 'react';
import { Map, List } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import BasicQueryBuilder from 'ui/containers/BasicQueryBuilder';
import SavedQueries from 'ui/containers/QueryBuilder/SavedQueries';
import RawQueryBuilder from 'ui/components/RawQueryBuilder';
import { withState, compose } from 'recompose';
import { connect } from 'react-redux';
import { clearModelsCache } from 'ui/redux/actions';
import styles from './querybuilder.css';

const BLANK_QUERY = new Map();

class QueryBuilder extends Component {
  static propTypes = {
    componentPath: PropTypes.instanceOf(List),
    query: PropTypes.instanceOf(Map),
    onChange: PropTypes.func,
    isRawMode: PropTypes.bool,
    setIsRawMode: PropTypes.func,
    clearModelsCache: PropTypes.func,
  }

  static defaultProps = {
    query: BLANK_QUERY,
    onChange: () => null,
  }

  toggleRaw = (e) => {
    e.preventDefault();
    const { setIsRawMode, isRawMode } = this.props;
    setIsRawMode(!isRawMode);
  }

  onQueryChange = (newQuery) => {
    this.props.onChange(newQuery);
  }

  clearQuery = (e) => {
    e.preventDefault();
    this.onQueryChange(BLANK_QUERY);
  }

  refreshStatements = (e) => {
    e.preventDefault();
    this.props.clearModelsCache({ schema: 'statement', filter: this.props.query });
  }

  renderBuilder = () => {
    const { isRawMode } = this.props;

    return (isRawMode ? (
      <RawQueryBuilder
        onQueryChange={this.onQueryChange}
        query={this.props.query} />
    ) : (
      <BasicQueryBuilder
        componentPath={this.props.componentPath}
        onQueryChange={this.onQueryChange}
        query={this.props.query}
        defaults={this.props.defaults} />
    ));
  }

  renderButtons = ({ isRawMode }) => (
    <div className={styles.buttonBox}>
      <button
        className="btn btn-default btn-xs"
        onClick={this.refreshStatements}
        title="Refresh statements">
        <i className="ion-refresh" />
      </button>
      <button
        className="btn btn-default btn-xs"
        onClick={this.clearQuery}
        title="Clear query">
        <i className="ion-close-round" />
      </button>
      <button
        className="btn btn-default btn-xs"
        onClick={this.toggleRaw}
        title="Toggle edit mode">
        <i className={`icon ${isRawMode ? 'ion-code-working' : 'ion-code'}`} />
      </button>
    </div>
  )

  render = () => (
    <div>
      {this.renderButtons(this.props)}
      <div className={styles.queryForm} >
        <SavedQueries query={this.props.query} onQueryChange={this.onQueryChange} />
        {this.renderBuilder()}
      </div>
    </div>
  );
}

export default compose(
  withStyles(styles),
  withState('isRawMode', 'setIsRawMode', false),
  connect(() => ({}), { clearModelsCache })
)(QueryBuilder);

