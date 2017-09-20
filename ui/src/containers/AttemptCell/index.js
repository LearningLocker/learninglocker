import React, { Component, PropTypes } from 'react';
import { List, Map } from 'immutable';
import moment from 'moment';
import { updateModel } from 'ui/redux/modules/models';
import { connect } from 'react-redux';
import Spinner from 'ui/components/Spinner';

class AttemptCell extends Component {
  static propTypes = {
    journeyProgress: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func,
  }

  onChangeAttempt = (e) => {
    const { journeyProgress } = this.props;
    const value = e.target.value;
    this.props.updateModel(['journeyProgress', journeyProgress.get('_id'), 'attemptNumber'], value);
  }

  renderAttempts = (journeyProgress) => {
    const completions = journeyProgress.get('completions', new List());
    if (completions.isEmpty()) return 'Current';
    return (
      <select className="form-control" onChange={this.onChangeAttempt}>
        <option value={'CURRENT'}>Current</option>
        {completions.map((attempt, index) => (
          <option key={index} value={index}>
            {moment(attempt.get('completedAt')).format('ddd DD MMM YYYY h:mm:ss')}
          </option>
        )).valueSeq()}
      </select>
    );
  }

  render() {
    const { journeyProgress, ...props } = this.props;
    if (!journeyProgress) return <div {...props}><Spinner /></div>;
    return (
      <div {...props}>
        { this.renderAttempts(journeyProgress) }
      </div>
    );
  }
}

export default connect(() => ({}), { updateModel })(AttemptCell);
