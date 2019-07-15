import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withModel } from 'ui/utils/hocs';
import { withProps, compose } from 'recompose';
import VisualiseIcon from 'ui/components/VisualiseIcon';
import VisualiseText from 'ui/components/VisualiseText';
import {
  LEADERBOARD,
  XVSY,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  PIE,
} from 'ui/utils/constants';
import { default as CustomBarChartCard } from 'ui/containers/Visualisations/CustomBarChart/Card';
import { default as CustomColumnChartCard } from 'ui/containers/Visualisations/CustomColumnChart/Card';

const schema = 'visualisation';

class TypeEditor extends Component {

  static propTypes = {
    updateModel: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      type: props.model.get('type'),
    };
  }

  shouldComponentUpdate = (_, nextState) =>
    this.state.type !== nextState.type

  onClickTypeLEADERBOARD = () => this.setState({ type: LEADERBOARD });
  onClickTypeXVSY = () => this.setState({ type: XVSY });
  onClickTypeSTATEMENTS = () => this.setState({ type: STATEMENTS });
  onClickTypeFREQUENCY = () => this.setState({ type: FREQUENCY });
  onClickTypeCOUNTER = () => this.setState({ type: COUNTER });
  onClickTypePIE = () => this.setState({ type: PIE });

  onClickSubmit = () => {
    this.props.updateModel({
      path: ['type'],
      value: this.state.type,
    });
  }

  render = () => (
    <div id="new-visualisation-custom">
      <div style={{ maxHeight: '500px', padding: '0px', overflow: 'auto' }}>
        {/* [Refactor] Replace VisualiseIcon with "Card" component
            https://github.com/LearningLocker/enterprise/issues/991
          */}
        <CustomBarChartCard
          active={this.state.type === LEADERBOARD}
          onClick={this.onClickTypeLEADERBOARD} />

        <VisualiseIcon
          type={XVSY}
          active={this.state.type === XVSY}
          onClick={this.onClickTypeXVSY} />

        <CustomColumnChartCard
          active={this.state.type === STATEMENTS}
          onClick={this.onClickTypeSTATEMENTS} />

        <VisualiseIcon
          type={FREQUENCY}
          active={this.state.type === FREQUENCY}
          onClick={this.onClickTypeFREQUENCY} />

        <VisualiseIcon
          type={COUNTER}
          active={this.state.type === COUNTER}
          onClick={this.onClickTypeCOUNTER} />

        <VisualiseIcon
          type={PIE}
          active={this.state.type === PIE}
          onClick={this.onClickTypePIE} />
      </div>

      {this.state.type &&
        <div className="row">
          <div className="col-xs-10 text-left">
            <VisualiseText type={this.state.type} />
          </div>
          <div className="col-xs-2 text-right">
            <a onClick={this.onClickSubmit} className="btn btn-primary btn-sm"><i className="icon ion-checkmark" /></a>
          </div>
        </div>
      }
    </div>
  )
}

export default compose(
  withProps(props => ({
    schema,
    id: props.model.get('_id'),
  })),
  withModel
)(TypeEditor);
