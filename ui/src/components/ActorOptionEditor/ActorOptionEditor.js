import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { TextInputGroup } from 'ui/components';
import { Button } from 'react-toolbox/lib/button';
import styles from './styles.css';

class ActorOptionEditor extends Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
  }

  static defaultProps = {
    onSubmit: () => {},
    onCancel: () => {},
  }

  state = { targetType: null }

  onChangeTarget = (targetType) => {
    this.setState({ targetType });
  }

  renderForm = () => {
    const { targetType } = this.state;
    const { onSubmit, onCancel } = this.props;

    switch (targetType) {
      case 'mbox': return (
        <TextInputGroup
          fields={['mbox']}
          onSubmit={onSubmit}
          onCancel={onCancel} />
      );
      case 'account': return (
        <TextInputGroup
          fields={['account', 'homepage']}
          onSubmit={onSubmit}
          onCancel={onCancel} />
      );
      default: return (
        <div className={styles.form}>
          <Button onClick={this.onChangeTarget.bind(null, 'mbox')} icon={<i className="ion-checkmark" />} label="Mbox" />
          <Button onClick={this.onChangeTarget.bind(null, 'account')} icon={<i className="ion-checkmark" />} label="Account" />
        </div>
      );
    }
  }

  render = () => this.renderForm(styles);
}

export default withStyles(styles)(ActorOptionEditor);

