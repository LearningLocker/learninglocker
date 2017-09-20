import { Map, List } from 'immutable';
import React, { Component, PropTypes } from 'react';
import Portal from 'react-portal';
import { compose, renameProp } from 'recompose';
import { withSchema } from 'ui/utils/hocs';
import CheckboxGroup from 'react-checkbox-group';

const NONE = 'stages/NONE';

const enhance = compose(
  withSchema('lrs'),
  renameProp('models', 'lrss')
);

class VisualisationStorePicker extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    lrss: PropTypes.instanceOf(Map),
    isOpened: PropTypes.bool,
    onClickClose: PropTypes.func,
    onClickNext: PropTypes.func,
    updateModel: PropTypes.func
  }

  static defaultProps = {
    isOpened: false,
    model: new Map()
  }

  constructor(props) {
    super(props);
    this.state = this.getStateFromProps(props);
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState(this.getStateFromProps(nextProps));
  }

  onChangeSources = () => {
    const sources = this.sourcesGroup.getCheckedValues();
    this.setState({ sources: new List(sources) });
  }

  onSelectAll = () => {
    const sources = this.props.lrss.map(lrs => lrs.get('_id')).toList();
    this.setState({ sources });
  }

  onClickSubmit = () => {
    this.props.onClickNext();
    const { model } = this.props;
    this.props.updateModel({
      id: model.get('_id'),
      path: 'sources',
      value: this.state.sources
    });
  }

  onClickClose = () => {
    this.props.onClickClose();
    const { model } = this.props;
    this.props.updateModel({
      id: model.get('_id'),
      path: 'sources',
      value: this.state.sources
    });
    this.props.updateModel({
      id: model.get('_id'),
      path: 'suggestedStep',
      value: NONE
    });
  }

  getStateFromProps = props => ({ sources: props.model.get('sources', new List()) })

  render = () => {
    const { isOpened, lrss } = this.props;
    const { sources } = this.state;
    const allSelected = lrss.size === sources.size;
    const statementCount = lrss.reduce((count, lrs) => (count + lrs.get('statementCount', 0)), 0);

    return (
      <Portal isOpened={isOpened}>
        <span>
          <div className="modal animated fast fadeIn">
            <div className="modal-dialog">
              <div className="modal-content">

                <div className="modal-header modal-header-bg">
                  <button type="button" className="close" aria-label="Close" onClick={this.onClickClose}><span aria-hidden="true">&times;</span></button>
                  <h4 className="modal-title">Choose record store</h4>
                </div>

                <div className="modal-body clearfix" style={{ maxHeight: '500px', overflow: 'auto' }}>
                  { lrss.size > 0 ? (
                    <span>
                      <label htmlFor="storeSelect" className="pull-right">
                        <input id="storeSelect" type="checkbox" onChange={this.onSelectAll} checked={allSelected} /> Select all
                      </label>

                      <CheckboxGroup name="sources" value={sources.toJS()} onChange={this.onChangeSources} ref={(c) => { this.sourcesGroup = c; }}>
                        {lrss.valueSeq().map(lrs => (
                          <div key={lrs.get('_id')}>
                            <label htmlFor={`lrs-${lrs.get('_id')}`} key={lrs.get('_id')}>
                              <input id={`lrs-${lrs.get('_id')}`} type="checkbox" value={lrs.get('_id')} /> {lrs.get('title')} ({lrs.get('statementCount')} statements)
                            </label>
                          </div>
                        ))}
                      </CheckboxGroup>
                    </span>
                  ) : (
                    <p>
                      No stores created yet.
                    </p>
                  )}

                </div>

                {sources.size > 0 &&
                  <div className="modal-footer">
                    <div className="col-xs-8 text-left">
                      { statementCount } statements total.
                    </div>
                    <div className="col-xs-4">
                      <a onClick={this.onClickSubmit} className="btn btn-primary btn-sm"><i className="icon ion-checkmark" /></a>
                    </div>
                  </div>}
              </div>
            </div>
            <div className="modal-backdrop" onClick={this.onClickClose} />
          </div>
        </span>
      </Portal>
    );
  }
}

export default enhance(VisualisationStorePicker);
