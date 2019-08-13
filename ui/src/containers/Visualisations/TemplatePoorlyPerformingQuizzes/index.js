import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';
import Editor from './Editor';

 /**
 * @param {immutable.Map} props.model - visualisation model
 */
const TemplatePoorlyPerformingQuestions = compose(
  connect(
    () => ({}),
    { updateModel },
  ),
)(Editor);

TemplatePoorlyPerformingQuestions.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
};

export default TemplatePoorlyPerformingQuestions;
