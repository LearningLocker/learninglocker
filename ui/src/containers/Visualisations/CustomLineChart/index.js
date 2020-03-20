import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';
import Editor from './Editor';

/**
 * @param {immutable.Map} props.model - visualisation model
 * @param {string} props.orgTimezone
 */
const CustomLineChart = compose(
  connect(
    () => ({}),
    { updateModel },
  ),
)(Editor);

CustomLineChart.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  orgTimezone: PropTypes.string.isRequired,
};

export default CustomLineChart;
