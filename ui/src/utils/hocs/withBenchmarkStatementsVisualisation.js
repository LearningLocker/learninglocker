import { compose } from 'recompose';
import { connect } from 'react-redux';
import {
    fetchVisualisation
  } from 'ui/redux/modules/visualise';

export default compose(
    connect(() => ({}), fetchVisualisation)
);
