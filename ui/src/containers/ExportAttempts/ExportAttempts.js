import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

@connect(() => ({})
, {})
export default class ProjectorModal extends Component {
  static propTypes = {
    type: PropTypes.string
  }

  static defaultProps = {
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount = () => {
    // const { type } = this.props;
    // this.props.fetchModels('export', fromJS({
    //   validFor: {'$in': [type]}
    // }));
  }

  render = () =>
    <div>Export Attempts</div>

}
