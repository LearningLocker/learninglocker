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
const TemplateCuratrLearnerInteractionsByDateAndVerb = compose(
  connect(
    () => ({}),
    { updateModel },
  ),
)(Editor);

TemplateCuratrLearnerInteractionsByDateAndVerb.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  orgTimezone: PropTypes.string.isRequired,
};

export default TemplateCuratrLearnerInteractionsByDateAndVerb;
