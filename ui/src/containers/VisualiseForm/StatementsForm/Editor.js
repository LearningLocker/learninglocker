import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { Tab } from 'react-toolbox/lib/tabs';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { update$dteTimezone } from 'lib/helpers/update$dteTimezone';
import { updateModel } from 'ui/redux/modules/models';
import Tabs from 'ui/components/Material/Tabs';
import SeriesEditor from './SeriesEditor';
import AxesEditor from './AxesEditor/AxesEditor';
import styles from '../visualiseform.css';
import OptionsEditor from './OptionsEditor';
import NewVisualisation from './NewVisualisation';

const SCHEMA = 'visualisation';

class Editor extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map), // visualisation model
    orgTimezone: PropTypes.string.isRequired,
    exportVisualisation: PropTypes.func,
    updateModel: PropTypes.func,
    shouldShowNewVisualisation: PropTypes.bool,
  }

  state = {
    step: 0,
  }

  componentDidMount = () => {
    const timezone = this.props.model.get('timezone') || this.props.orgTimezone;
    this.updateQueriesIfUpdated(timezone);
  }

  componentDidUpdate = (prevProps) => {
    const prevTimezone = prevProps.model.get('timezone') || prevProps.orgTimezone;
    const currentTimezone = this.props.model.get('timezone') || this.props.orgTimezone;

    if (prevTimezone !== currentTimezone) {
      this.updateQueriesIfUpdated(currentTimezone);
    }
  }

  /**
   * Update a model if its query is updated
   */
  updateQueriesIfUpdated = (timezone) => {
    // Values of these paths may have `{ $dte: ... }` sub queries.
    const paths = ['filters', 'axesxQuery', 'axesyQuery'];

    paths.forEach((path) => {
      const query = this.props.model.get(path, new Map());
      const timezoneUpdated = update$dteTimezone(query, timezone);

      // Update visualisation.{path} when timezone offset in the filter query is changed
      if (!timezoneUpdated.equals(query)) {
        this.props.updateModel({
          schema: SCHEMA,
          id: this.props.model.get('_id'),
          path,
          value: timezoneUpdated,
        });
      }
    });
  }

  changeAttr = attr => newValue =>
    this.props.updateModel({
      schema: SCHEMA,
      id: this.props.model.get('_id'),
      path: attr,
      value: newValue
    })

  onChangeAttr = attr => event =>
    this.changeAttr(attr)(event.target.value)

  changeStep = step =>
    this.setState({ step })

  isSeriesType = () => false;

  renderDescription = description => (
    <div className="form-group">
      <label htmlFor="lrsDescriptionInput">Name</label>
      <input
        id="lrsDescriptionInput"
        className="form-control"
        placeholder="What does this visualisation show?"
        value={description}
        onChange={this.onChangeAttr('description')} />
    </div>
  )

  renderTabs = () => {
    // The Tabs component requires its children to be Tab items
    // We cannot do inline conditionals, therefore we construct the children and pass them in via the props
    const tabs = [
      <Tab key="axes" label="Axes">
        <AxesEditor
          model={this.props.model}
          orgTimezone={this.props.orgTimezone} />
      </Tab>,
      <Tab key="options" label="Options">
        { this.renderOptionsEditor() }
      </Tab>
    ];


    const isCounter = (this.props.model.get('type') === 'COUNTER');
    const seriesTab = <Tab key="series" label="Series">{ this.renderSeriesEditor() }</Tab>;
    const StatementSeriesTab = <Tab key="filter" label="Filter">{ this.renderSeriesEditor() }</Tab>;
    if (isCounter) {
      tabs.splice(1, 0, StatementSeriesTab);
    } else {
      tabs.splice(1, 0, seriesTab);
    }
    return (
      <div className={styles.tab}>
        { this.renderDescription(this.props.model.get('description')) }
        <Tabs index={this.state.step} onChange={this.changeStep}> children={tabs}</Tabs>
      </div>
    );
  }

  renderSeriesEditor = () => (
    <SeriesEditor
      orgTimezone={this.props.orgTimezone}
      model={this.props.model}
      exportVisualisation={this.props.exportVisualisation} />
  )

  renderOptionsEditor = () => (
    <OptionsEditor
      model={this.props.model}
      orgTimezone={this.props.orgTimezone}
      updateModel={this.props.updateModel} />
  )

  renderSteps = () => (
    this.isSeriesType() ? this.renderSeriesEditor() : this.renderTabs()
  )

  render = () => {
    if (this.props.shouldShowNewVisualisation) {
      return <NewVisualisation visualisationModel={this.props.model} />;
    }
    return this.renderSteps();
  }
}

export default (
  withStyles(styles),
  connect(() => ({}), { updateModel })
)(Editor);
