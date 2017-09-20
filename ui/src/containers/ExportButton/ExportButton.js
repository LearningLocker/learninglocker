import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  exportSetModalState,
  exportKeyPathSelector,
  exportFetchStateSelector,
  IN_PROGRESS, SUCCESS, FAILED
} from 'ui/redux/modules/exports';
import { List } from 'immutable';
import classNames from 'classnames';
import { SmallSpinner } from 'ui/components';
import { ExportModal } from 'ui/containers';

class ExportButton extends Component {
  static propTypes = {
    id: PropTypes.string,
    schema: PropTypes.string,
    pipelines: PropTypes.instanceOf(List),
    grey: PropTypes.bool,
    fetchState: PropTypes.string,
    children: PropTypes.node,
  }
  static defaultProps = {
    derivedPipelines: new List(),
    type: 'STATEMENTS'
  }
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false
    };
  }

  onOpenModal = () => {
    this.setState({ isModalOpen: true });
  }

  onCloseModal = () => {
    this.setState({ isModalOpen: false });
  }

  renderButtonContent = () => {
    const { grey, fetchState } = this.props;
    switch (fetchState) {
      case IN_PROGRESS: return (<SmallSpinner />);
      case SUCCESS: return (<i className={`icon animated fadeIn ion-checkmark ${grey && 'grey'}`} />);
      case FAILED: return (<i className={`icon animated fadeIn ion-close ${grey && 'grey'}`} />);
      default: return (this.props.children
        ? this.props.children
        : <i className={`icon ion-android-download ${grey && 'grey'}`} />
      );
    }
  }

  render = () => {
    const { isModalOpen } = this.state;
    const { id, schema, pipelines } = this.props;
    const useDefaults = !this.props.grey && !this.props.children;
    const classes = classNames({
      'btn-sm btn': useDefaults,
      'btn-inverse': useDefaults
    });
    const style = useDefaults ? { width: '33px' } : {};
    return (
      <a className={classes} onClick={this.onOpenModal} style={style} title="Export" >
        <ExportModal
          isOpen={isModalOpen}
          onClose={this.onCloseModal}
          id={id}
          schema={schema}
          pipelines={pipelines} />
        {this.renderButtonContent()}
      </a>
    );
  }
}

export default connect((state, ownProps) => {
  const keyPath = exportKeyPathSelector(ownProps.schema, ownProps.id);
  return {
    keyPath,
    fetchState: exportFetchStateSelector(keyPath)(state),
  };
}, { exportSetModalState })(ExportButton);
