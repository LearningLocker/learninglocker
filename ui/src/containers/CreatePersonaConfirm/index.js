import React, { Component, PropTypes } from 'react';
import Portal from 'react-portal';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { createPersonaFromIdentifier } from 'ui/redux/modules/people';

const enhance = compose(
  connect(() => ({}), { createPersonaFromIdentifier })
);

class CreatePersonaConfirm extends Component {
  static propTypes = {
    isOpened: PropTypes.bool,
    onClickClose: PropTypes.func,
    createPersonaFromIdentifier: PropTypes.func,
    id: PropTypes.string,
  }

  static defaultProps = {
    isOpened: false,
  }

  createPersonaFromIdentifier = () => {
    this.props.onClickClose();
    this.props.createPersonaFromIdentifier(this.props.id);
  }

  handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.createPersonaFromIdentifier();
  }

  handleClose = () => {
    this.props.onClickClose();
  }

  render = () => (
    <Portal isOpened={this.props.isOpened}>
      <span>
        <div className="modal animated fast fadeIn">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header modal-header-bg">
                <button type="button" className="close" aria-label="Close" onClick={this.handleClose}><span aria-hidden="true">&times;</span></button>
                <h4 className="modal-title">Create Persona from Persona Identifier</h4>
              </div>

              <div className="modal-body clearfix" style={{ maxHeight: '500px', overflow: 'auto' }}>
                <div className="row">
                  <div className="text-center">
                      Are you sure you want to make a new persona?
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <div className="row">
                  <div className="text-center">
                    <a onClick={this.handleClick} className="btn btn-primary btn-sm"><i className="icon ion-checkmark" /> Confirm</a>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <a onClick={this.handleClose} className="btn btn-primary btn-sm"><i className="icon ion-close-round" /> Cancel</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop" onClick={this.handleClose} />
        </div>
      </span>
    </Portal>
  )
}

export default enhance(CreatePersonaConfirm);
