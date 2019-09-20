import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';
import { setInMetadata } from 'ui/redux/modules/metadata';
import Editor from './Editor';

/**
 * @param {immutable.Map} props.model - visualisation model
 * @param {string} props.orgTimezone
 */
const TemplateMostPopularActivities = compose(
  connect(
    () => ({}),
    { updateModel, setInMetadata },
  ),
)(Editor);

TemplateMostPopularActivities.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  orgTimezone: PropTypes.string.isRequired,
};

export default TemplateMostPopularActivities;
