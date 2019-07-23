import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { Tab } from 'react-toolbox/lib/tabs';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { update$dteTimezone } from 'lib/helpers/update$dteTimezone';
import { updateModel } from 'ui/redux/modules/models';
import Tabs from 'ui/components/Material/Tabs';
import SeriesEditor from './SeriesEditor';
import AxesEditor from './AxesEditor';
import OptionsEditor from './OptionsEditor';
import styles from './styles.css';

class Editor extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map), // visualisation model
    orgTimezone: PropTypes.string.isRequired,
    updateModel: PropTypes.func,
  }

  state = {
    tabIndex: 0,
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

  onChangeTab = tabIndex => this.setState({ tabIndex })

  /**
   * Update a model if its query is updated
   */
  updateQueriesIfUpdated = (timezone) => {
    // Values of these paths may have `{ $dte: ... }` sub queries.
    const paths = ['filters', 'axesxQuery', 'axesyQuery'];

    paths.forEach((path) => {
      const query = this.props.model.get(path) || new Map();
      const timezoneUpdated = update$dteTimezone(query, timezone);

      // Update visualisation.{path} when timezone offset in the filter query is changed
      if (!timezoneUpdated.equals(query)) {
        this.props.updateModel({
          schema: 'visualisation',
          id: this.props.model.get('_id'),
          path,
          value: timezoneUpdated,
        });
      }
    });
  }

  onChangeDescription = (e) => {
    this.props.updateModel({
      schema: 'visualisation',
      id: this.props.model.get('_id'),
      path: 'description',
      value: e.target.value
    });
  }

  // This method looks strange, but it is used on LearningLocker/enterprise
  isSeriesType = () => false;

  render = () => {
    // This if-conditional is used on LearningLocker/enterprise
    if (this.isSeriesType()) {
      return (
        <SeriesEditor
          model={this.props.model} />
      );
    }

    const isCounter = (this.props.model.get('type') === 'COUNTER');

    return (
      <div className={styles.tab}>
        <div className="form-group">
          <label htmlFor="lrsDescriptionInput">Name</label>
          <input
            id="lrsDescriptionInput"
            className="form-control"
            placeholder="What does this visualisation show?"
            value={this.props.model.get('description', '')}
            onChange={this.onChangeDescription} />
        </div>

        <Tabs index={this.state.tabIndex} onChange={this.onChangeTab}>
          <Tab key="axes" label="Axes">
            <AxesEditor
              model={this.props.model}
              orgTimezone={this.props.orgTimezone} />
          </Tab>

          <Tab key="series" label={isCounter ? 'Filter' : 'Series'}>
            <SeriesEditor
              model={this.props.model}
              orgTimezone={this.props.orgTimezone} />
          </Tab>

          <Tab key="options" label="Options">
            <OptionsEditor
              model={this.props.model}
              orgTimezone={this.props.orgTimezone}
              updateModel={this.props.updateModel} />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default (
  withStyles(styles),
  connect(() => ({}), { updateModel })
)(Editor);
