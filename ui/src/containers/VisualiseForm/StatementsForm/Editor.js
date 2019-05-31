import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { Tab } from 'react-toolbox/lib/tabs';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Tabs from 'ui/components/Material/Tabs';
import { updateModel } from 'ui/redux/modules/models';
import styles from '../visualiseform.css';
import SeriesEditor from './SeriesEditor';
import AxesEditor from './AxesEditor';
import OptionsEditor from './OptionsEditor';

class Editor extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    exportVisualisation: PropTypes.func,
  }

  state = {
    tabIndex: 0,
  }

  onChangeTab = tabIndex => this.setState({ tabIndex })

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
          model={this.props.model}
          exportVisualisation={this.props.exportVisualisation} />
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
            value={this.props.model.get('description')}
            onChange={this.onChangeDescription} />
        </div>

        <Tabs index={this.state.tabIndex} onChange={this.onChangeTab}>
          <Tab key="axes" label="Axes">
            <AxesEditor model={this.props.model} />
          </Tab>

          <Tab key="series" label={isCounter ? 'Filter' : 'Series'}>
            <SeriesEditor
              model={this.props.model}
              exportVisualisation={this.props.exportVisualisation} />
          </Tab>

          <Tab key="options" label="Options">
            <OptionsEditor model={this.props.model} />
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
