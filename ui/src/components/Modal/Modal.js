import React, { Component, PropTypes } from 'react';
import Portal from 'react-portal';

export default class ProjectorModal extends Component {
  static propTypes = {
    // if the projection editor modal is open, should be provided by @connect
    isOpened: PropTypes.bool,
    onClose: PropTypes.func,
    body: PropTypes.node,
    footer: PropTypes.node
  }

  onClickClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onClose();
  }

  render = () => {
    const { isOpened } = this.props;
    return (
      <Portal isOpened={isOpened}>
        <span>
          <div className="modal animated fast fadeIn">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header modal-header-bg">
                  <button type="button" className="close" aria-label="Close" onClick={this.onClickClose}>
                    <span aria-hidden="true">&times;</span>
                  </button>
                  <h4 className="modal-title">Customise output</h4>
                </div>
                <div className="modal-body clearfix" style={{ padding: '0px', overflow: 'auto' }} >
                  { this.props.body }
                </div>
                <div className="modal-footer">
                  { this.props.footer }
                </div>
              </div>
            </div>
            <div className="modal-backdrop" onClick={this.onClickClose} />
          </div>
        </span>
      </Portal>
    );
  }
}
