import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CirclePicker } from 'react-color';
import { compose, withProps } from 'recompose';
import { Map, List } from 'immutable';
import { MAX_CUSTOM_COLORS } from 'lib/constants/visualise';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import { VISUALISATION_COLORS } from 'ui/utils/constants';
import { withModel } from 'ui/utils/hocs';
import CustomColorPicker from './CustomColorPicker';

class ColorPicker extends React.PureComponent {

  static propTypes = {
    color: PropTypes.string,
    model: PropTypes.instanceOf(Map), // organisation
    onChange: PropTypes.func,
    updateModel: PropTypes.func, // update organisation
  }

  constructor(props) {
    super(props);
    this.state = { isOpen: false };
  }

  onClickEdit = () => {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  }

  /**
   * @params {tinycolor.Instance} color
   */
  onSelectCustomColor = (color) => {
    this.setState({ isOpen: false });
    this.props.onChange(color);

    // Add new selected color to the head of customColors
    const newCustomColors = this.getCustomColors()
      .unshift(color.hex)
      .toSet()
      .toList()
      .slice(0, MAX_CUSTOM_COLORS);

    if (!this.getCustomColors().equals(newCustomColors)) {
      this.props.updateModel({
        path: ['customColors'],
        value: newCustomColors,
      });
    }
  }

  /**
   * @returns {immutable.List} - List of hex. e.g. List(['#FFFFFF', '#2AFEC9'])
   */
  getCustomColors = () => this.props.model.get('customColors', new List());

  render = () => {
    const {
      color,
      onChange,
    } = this.props;

    const customColors = this.getCustomColors();

    // The selected color or a color that the organisation recently selected
    const trendColor = VISUALISATION_COLORS.includes(color.toUpperCase()) ? customColors.first() : color;

    return (
      <div style={{ display: 'flex' }}>
        <CirclePicker
          color={color}
          colors={trendColor ? VISUALISATION_COLORS.concat(trendColor) : VISUALISATION_COLORS}
          onChange={onChange}
          width={'auto'} />

        <div>
          <div
            style={{
              paddingLeft: '14px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={this.onClickEdit} >
            <i className="icon ion-edit" />
          </div>

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
                  <div style={{ position: 'absolute', bottom: '40px', right: '-32px' }}>
                    <CustomColorPicker
                      initialColor={color}
                      customColors={customColors}
                      onClickCheckMark={this.onSelectCustomColor} />
                  </div>
                </div>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default compose(
  connect(state => ({
    organisationId: activeOrgIdSelector(state)
  }), {}),
  withProps(({ organisationId }) => ({
    id: organisationId,
    schema: 'organisation'
  })),
  withModel,
)(ColorPicker);
