import React from 'react';
import { BlockPicker } from 'react-color';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { VISUALISATION_COLORS } from 'ui/utils/constants';
import styles from './styles.css';

class ColorPicker extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
  }

  onClick = () => {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render = () => {
    const {
      color,
      onChange,
    } = this.props;

    return (
      <div>
        <div
          onClick={this.onClick}
          style={{
            background: color,
            width: '22px',
            height: '22px',
            float: 'left',
            marginRight: '10px',
            marginBottom: '10px',
            borderRadius: '11px',
            cursor: 'pointer',
            outline: 'none',
          }} />

        {
          this.state.isOpen && (
            <div style={{ position: 'absolute', zIndex: '2' }}>
              <div
                style={{
                  position: 'fixed',
                  top: '0px',
                  right: '0px',
                  bottom: '0px',
                  left: '0px',
                }}
                onClick={() => this.setState({ isOpen: false })} />
              <div style={{ position: 'relative' }}>
                <div className={styles.blockPickerWrapper} style={{ position: 'absolute', top: '-190px' }}>
                  <BlockPicker
                    triangle="hide"
                    color={color}
                    colors={VISUALISATION_COLORS}
                    width="240px"
                    onChange={c => onChange(c)} />
                </div>
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

export default withStyles(styles)(ColorPicker);
