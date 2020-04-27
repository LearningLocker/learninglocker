import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Portal from 'react-portal';
import { compose, withHandlers, setPropTypes } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import Input from 'ui/components/Material/Input';

const enhance = compose(
  setPropTypes({
    onClickClose: PropTypes.func.isRequired
  }),
  withModel,
  withHandlers({
    onTitleChange: ({ updateModel }) => (value) => {
      updateModel({ path: ['title'], value });
    }
  })
);


class EditConfirm extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map).isRequired,
    isOpened: PropTypes.bool.isRequired,
    onClickClose: PropTypes.func.isRequired,
    onTitleChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    const { model } = this.props;
    this.state = {
      title: model.get('title', ' '),
    };
  }

  onTitleChange = (value) => {
    this.setState({
      title: value
    });
  };

  handlerTitle = () => {
    const { onTitleChange, onClickClose } = this.props;
    const { title } = this.state;
    onTitleChange(title);
    onClickClose();
  };

  render() {
    const { isOpened, onClickClose } = this.props;
    const { title } = this.state;

    return (
      <Portal isOpened={isOpened}>
        <span>
          <div className="modal animated fast fadeIn">
            <div className="modal-dialog">
              <div className="modal-content">

                <div className="modal-header modal-header-bg">
                  <button type="button" className="close" aria-label="Close" onClick={onClickClose}>
                    <span aria-hidden="true">&times;</span>
                  </button>
                  <h4 className="modal-title">Edit Dashboard Title</h4>
                </div>

                <div
                  className="modal-body clearfix"
                  style={{ maxHeight: '500px', minWidth: '350px', overflow: 'auto', textAlign: 'center' }}>
                  <Input
                    type="text"
                    name="Title"
                    label="Dashboard Title"
                    value={title}
                    onChange={this.onTitleChange}
                    style={{ fontSize: '13px' }} />
                </div>

                <div className="modal-footer" style={{ textAlign: 'center' }}>
                  <a
                    onClick={this.handlerTitle}
                    className="btn btn-primary btn-sm">
                    <i className="icon ion-checkmark" /> Confirm
                    </a>
                  <a
                    onClick={onClickClose}
                    className="btn btn-primary btn-sm">
                    <i className="icon ion-close-round" /> Cancel
                    </a>
                </div>
              </div>
            </div>
            <div className="modal-backdrop" onClick={onClickClose.bind(null)} />
          </div>
        </span>
      </Portal>
    );
  }
}

export default enhance(EditConfirm);
