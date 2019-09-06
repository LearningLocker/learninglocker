import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import colorHelper from 'react-color/lib/helpers/color';
import { ColorWrap, EditableInput, Hue, Saturation, Swatch } from 'react-color/lib/components/common';
import { ChromePointer } from 'react-color/lib/components/chrome/ChromePointer';
import { ChromePointerCircle } from 'react-color/lib/components/chrome/ChromePointerCircle';
import { MAX_CUSTOM_COLORS } from 'lib/constants/visualise';

/**
 * Styling is based on react-color
 * https://github.com/casesandberg/react-color
 */
const buildStyles = ({ hex }) => ({
  body: {
    padding: '16px 16px 12px',
  },
  checkMark: {
    textAlign: 'right',
  },
  color: {
    width: '42px',
    height: '42px',
    marginRight: '12px',
    borderRadius: '0px',
    background: `${hex}`,
  },
  controls: {
    display: 'flex',
    marginBottom: '12px',
  },
  hex: {
    flex: 1,
  },
  HEXinput: {
    width: '100%',
    marginTop: '12px',
    fontSize: '15px',
    color: '#333',
    padding: '0px',
    border: '0px',
    borderBottom: `2px solid ${hex}`,
    outline: 'none',
    height: '30px',
  },
  HEXlabel: {
    position: 'absolute',
    top: '0px',
    left: '0px',
    fontSize: '11px',
    color: '#999999',
    textTransform: 'capitalize',
  },
  HEXwrap: {
    position: 'relative',
  },
  hue: {
    height: '10px',
    position: 'relative',
    marginBottom: '12px',
  },
  Hue: {
    radius: '2px',
  },
  palette: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    width: '225px',
    background: '#fff',
    borderRadius: '2px',
    boxShadow: '0 0 2px rgba(0,0,0,.3), 0 4px 8px rgba(0,0,0,.3)',
    boxSizing: 'initial',
  },
  saturation: {
    width: '100%',
    paddingBottom: '55%',
    position: 'relative',
    borderRadius: '2px 2px 0 0',
    overflow: 'hidden',
  },
  Saturation: {
    radius: '2px 2px 0 0',
  },
  swatch: {
    width: '20px',
    height: '20px',
    borderRadius: '0px',
    marginBottom: '12px',
  },
});

/* eslint new-cap: ["error", { "capIsNew": false }] */
const CustomColorPickerInner = ColorWrap((props) => {
  const styles = buildStyles(props);

  // To fill space when customColors is less than 7.
  const dummySwatchListLength = Math.max(MAX_CUSTOM_COLORS - props.customColors.size, 0);
  const dummySwatchList = new List(Array(dummySwatchListLength)).map((_, i) => (
    <span key={`dummy-swatch-${i}`}>
      <div style={styles.swatch} />
    </span>
  ));

  return (
    <div style={styles.picker}>
      <div style={styles.saturation}>
        <Saturation
          style={styles.Saturation}
          hsl={props.hsl}
          hsv={props.hsv}
          pointer={ChromePointerCircle}
          onChange={props.onChange} />
      </div>

      <div style={styles.body}>
        <div style={styles.hue}>
          <Hue
            style={styles.Hue}
            hsl={props.hsl}
            pointer={ChromePointer}
            onChange={props.onChange} />
        </div>

        <div style={styles.controls}>
          <div style={styles.color} />

          <div style={styles.hex} >
            <EditableInput
              style={{ wrap: styles.HEXwrap, input: styles.HEXinput, label: styles.HEXlabel }}
              label="hex"
              placeholder="#000000"
              value={props.hex}
              onChange={props.onChange} />
          </div>
        </div>

        <div style={styles.palette} >
          {
            props.customColors.map(c => (
              <Swatch
                key={c}
                color={c}
                hex={c}
                onClick={props.onChange}
                style={styles.swatch}
                focusStyle={{
                  boxShadow: `0 0 4px ${c}`,
                }} />
            )).concat(dummySwatchList).valueSeq()
          }
        </div>

        <div style={styles.checkMark} >
          <button
            className="btn btn-primary btn-sm"
            onClick={props.onClickCheckMark}>
            <i className="ion ion-checkmark" />
          </button>
        </div>
      </div>
    </div>
  );
});

class CustomColorPicker extends React.PureComponent {

  static propTypes = {
    initialColor: PropTypes.string,

    // immutable.List<tinycolor.ColorInput>
    // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/tinycolor2/index.d.ts
    customColors: PropTypes.instanceOf(List),

    // (color: tinycolor.Instance) => void
    onClickCheckMark: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      color: colorHelper.toState(props.initialColor || '#2BD867')
    };
  }

  updateColorState = (color) => {
    this.setState({ color });
  }

  onClickCheckMark = () => {
    this.props.onClickCheckMark(this.state.color);
  }

  render = () => (
    <CustomColorPickerInner
      // Pass HSL to ColorWrap to fix Hue because if props.color has .hex property, HSL is calculated by the hex.
      // HSL calculated via hex is slightly different from original HSL
      // https://github.com/casesandberg/react-color/blob/f34fb60230510e1bf53c23c271209ce30fcaed75/src/helpers/color.js#L26-L27
      color={this.state.color.hsl}
      customColors={this.props.customColors}
      onChange={this.updateColorState}
      onClickCheckMark={this.onClickCheckMark} />
    )
}

export default CustomColorPicker;
