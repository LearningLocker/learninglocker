import React from 'react';
import _ from 'lodash';
import Portal from 'react-portal';

export default class SimpleTooltip extends React.Component {
  static propTypes = {
    mouseThrottle: React.PropTypes.number,
    width: React.PropTypes.number,
    children: React.PropTypes.node
  };
  static defaultProps = {
    mouseThrottle: 10,
    width: 200
  };
  state = {
    mouseX: null,
    mouseY: null
  };

  componentWillMount() {
    // attach mousemove event so tooltip always follows cursor.
    const { mouseThrottle } = this.props;
    // throttle handler so it only runs every n milliseconds.
    // save reference to it so we can remove it later
    this._throttledMouse = _.throttle(this._updateMouse, mouseThrottle || 0);
    document.addEventListener('mousemove', this._throttledMouse);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this._throttledMouse);
  }

  _updateMouse = (e) => {
    this.setState({ mouseX: e.clientX, mouseY: e.clientY });
  };

  render() {
    const styles = require('./simpletooltip.css');

    const { mouseX, mouseY } = this.state;
    const { width } = this.props;
    const style = {
      top: mouseY - 10,
      left: mouseX - (width + 16),
      width: width + 16,
      pointerEvents: 'none'
    };
    const contentStyle = { maxWidth: width };
    const triangleStyle = {
      position: 'absolute',
      top: 0,
      left: width,
      width: 0,
      height: 0,
      fontSize: 0,
      borderStyle: 'solid',
      borderWidth: '7px 0 7px 8px'
    };

    return (
      <Portal isOpened >
        <div className={styles.tooltip} style={style}>
          <div className={styles.tooltipContent} style={contentStyle}>
            {this.props.children}
          </div>
          <span className={styles.tooltipTriangleRight} style={triangleStyle} />
        </div>
      </Portal>
    );
  }
}
