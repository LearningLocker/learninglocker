import React, { Component, PropTypes } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { updateModel } from 'ui/redux/modules/models';
import Tabs from 'ui/components/Material/Tabs';
import { Tab } from 'react-toolbox/lib/tabs';
import TypeEditor from './TypeEditor';
import SeriesEditor from './SeriesEditor';
import AxesEditor from './AxesEditor/AxesEditor';
import styles from '../visualiseform.css';

const SCHEMA = 'visualisation';

class Editor extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    exportVisualisation: PropTypes.func
  }

  state = {
    step: 0,
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

  hasType = () =>
    this.props.model.has('type')

  isSeriesType = () => false;

  renderTypeEditor = () =>
    <TypeEditor model={this.props.model} />


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

  renderTabs = () => (
    <div className={styles.tab}>
      { this.renderDescription(this.props.model.get('description')) }
      <Tabs index={this.state.step} onChange={this.changeStep}>
        <Tab label="Axes">
          <AxesEditor model={this.props.model} />
        </Tab>
        <Tab label="Series">
          {this.renderSeriesEditor()}
        </Tab>
      </Tabs>
    </div>
  )

  renderSeriesEditor = () => (
    <SeriesEditor
      model={this.props.model}
      exportVisualisation={this.props.exportVisualisation} />
  )

  renderSteps = () => (
    this.isSeriesType() ? this.renderSeriesEditor() : this.renderTabs()
  )

  render = () => (
    this.hasType() ? this.renderSteps() : this.renderTypeEditor()
  )
}

export default (
  withStyles(styles),
  connect(() => ({}), { updateModel })
)(Editor);
