import React, { Component, PropTypes } from 'react';
import { withModel } from 'ui/utils/hocs';
import { withProps, compose } from 'recompose';
import VisualiseIcon from 'ui/components/VisualiseIcon';
import VisualiseText from 'ui/components/VisualiseText';
import { VISUALISATION_TYPES } from 'ui/utils/constants';

const schema = 'visualisation';

class TypeEditor extends Component {

  static propTypes = {
    updateModel: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = this.getStateFromProps(props);
  }

  componentWillReceiveProps = nextProps => (
    this.setState(this.getStateFromProps(nextProps))
  )

  shouldComponentUpdate = (nextProps, nextState) => !(
    this.state.type === nextState.type
  )

  onClickType = type => this.setState({ type })

  onClickSubmit = () => {
    const path = ['type'];
    const value = this.state.type;
    this.props.updateModel({ path, value });
  }

  getStateFromProps = props => ({ type: props.model.get('type') })

  isActive = type => this.state.type === type

  renderIcon = (type, index) => (
    <VisualiseIcon
      key={index}
      type={type}
      active={this.isActive(type)}
      onClick={this.onClickType.bind(null, type)} />
  )

  render = () => (
    <div>
      <div style={{ maxHeight: '500px', padding: '0px', overflow: 'auto' }}>
        {VISUALISATION_TYPES.map(this.renderIcon)}
      </div>

      { this.state.type &&
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
