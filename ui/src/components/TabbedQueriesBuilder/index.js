import React, { Component, PropTypes } from 'react';
import { List, Map } from 'immutable';
import Tabs from 'ui/components/Material/Tabs';
import { Tab } from 'react-toolbox/lib/tabs';
import DebounceInput from 'react-debounce-input';
import QueryBuilder from 'ui/containers/QueryBuilder';
import { CirclePicker } from 'react-color';
import { VISUALISATION_COLORS } from 'ui/utils/constants';

class TabbedQueriesBuilder extends Component {
  static propTypes = {
    labelled: PropTypes.bool,
    queries: PropTypes.instanceOf(List),
    componentBasePath: PropTypes.instanceOf(List),
    defaults: PropTypes.instanceOf(Map),
    onQueryChange: PropTypes.func,
    onDeleteQuery: PropTypes.func,
    onChangeLabel: PropTypes.func,
    onChangeColor: PropTypes.func,
  }

  state = {
    tabIndex: 0,
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(
      this.props.queries.equals(nextProps.queries) &&
      this.state.tabIndex === nextState.tabIndex
    );
  }

  canDeleteQuery = () => this.props.onDeleteQuery !== undefined

  changeTab = tabIndex => this.setState({ tabIndex });

  deleteQuery = (index) => {
    this.changeTab(0);
    this.props.onDeleteQuery(index);
  }

  renderQueryBuilder = index => (
    <div>
      <div className="form-group">
        <QueryBuilder
          componentPath={this.props.componentBasePath.push(index)}
          query={this.props.queries.getIn([index, '$match'], new Map())}
          onChange={this.props.onQueryChange.bind(null, index)}
          defaults={this.props.defaults} />
      </div>
      <div className="form-group">
        <CirclePicker
          onChangeComplete={(color) => {
            this.props.onChangeColor(index, color.hex);
          }}
          width="auto"
          colors={VISUALISATION_COLORS}
          color={this.props.queries.getIn([index, 'color'])} />
      </div>
    </div>
  );

  renderLabelledQuery = index => (
    <span>
      <div className="form-group">
        <label htmlFor="labelInput">Label</label>
        {
          this.canDeleteQuery() &&
            <span
              onClick={this.deleteQuery.bind(null, index)}
              title="Delete"
              className="btn-sm btn pull-right">
              <i className="icon ion-trash-b" />
            </span>
        }
        <DebounceInput
          debounceTimeout={400}
          className="form-control"
          value={this.props.queries.getIn([index, 'label'], `Series ${index + 1}`)}
          onChange={this.props.onChangeLabel.bind(null, index)} />
      </div>

      {this.renderQueryBuilder(index)}

    </span>
  );

  renderQuery = index => (
    this.props.labelled === false ?
    this.renderQueryBuilder(index) :
    this.renderLabelledQuery(index)
  );

  renderOneQuery = () => this.renderQuery(0);

  renderQueryTab = (query, index) => {
    const label = query.get('label') || `Series ${index + 1}`;
    return (
      <Tab label={label} key={index}>
        {this.renderLabelledQuery(index)}
      </Tab>
    );
  }

  renderManyQueries = () => (
    <Tabs
      index={this.state.tabIndex}
      onChange={this.changeTab}>
      {this.props.queries.map(this.renderQueryTab)}
    </Tabs>
  );

  render = () => {
    const hasNoQuery = this.props.queries.size === 0;
    if (hasNoQuery) return <span />;
    const hasOneQuery = this.props.queries.size === 1;
    if (hasOneQuery) return this.renderOneQuery();
    return this.renderManyQueries();
  }
}

export default TabbedQueriesBuilder;
