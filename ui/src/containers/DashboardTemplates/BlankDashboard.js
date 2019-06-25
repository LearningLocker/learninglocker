import { connect } from 'react-redux';
import { withProps, compose, withHandlers } from 'recompose';
import { loggedInUserId } from 'ui/redux/modules/auth';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import { CREATE_BLANK_DASHBOARD } from 'ui/redux/modules/dashboard/blankDashboard';
import TemplateCard from './TemplateCard';

const enhance = compose(
  withProps({
    title: 'Blank Dashboard',
  }),
  connect(
    state => ({
      userId: loggedInUserId(state),
      organisationId: activeOrgIdSelector(state)
    }),
    dispatch => ({
      createBlankDashboard: args => dispatch({
        ...args,
        dispatch,
        type: CREATE_BLANK_DASHBOARD,
      })
    })
  ),
  withHandlers({
    onSelect: ({ userId, organisationId, createBlankDashboard }) => () => {
      createBlankDashboard({ userId, organisationId });
    }
  }),
);

const BlankDashboard = enhance(TemplateCard);

export default BlankDashboard;
