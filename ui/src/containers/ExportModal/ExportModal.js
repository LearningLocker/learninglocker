import React, { Component, PropTypes } from 'react';
import { List } from 'immutable';
import { Dialog } from 'react-toolbox/lib/dialog';
import { ExportManager } from 'ui/containers';

export default class ExportModal extends Component {
  static propTypes = {
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
    pipelines: PropTypes.instanceOf(List),
    type: PropTypes.string,
  }

  static defaultProps = {
    isOpen: false
  }

  render = () => {
    const { isOpen } = this.props;

    return (
      <Dialog
        actions={[{ label: 'Cancel', onClick: this.props.onClose }]}
        active={isOpen}
        onEscKeyDown={this.props.onClose}
        onOverlayClick={this.props.onClose}
        title="Export"
        type="large" >
        <ExportManager
          pipelines={this.props.pipelines}
          type={this.props.type} />
      </Dialog>
    );
  }
}
