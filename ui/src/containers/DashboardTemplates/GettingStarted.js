import { connect } from 'react-redux';
import { withProps, compose, withHandlers } from 'recompose';
import { loggedInUserId } from 'ui/redux/modules/auth';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import { CREATE_GETTING_STARTED } from 'ui/redux/modules/dashboard/gettingStarted';
import TemplateCard from './TemplateCard';

const enhance = compose(
  withProps({
    title: 'Getting Started',
  }),
  connect(
    state => ({
      userId: loggedInUserId(state),
      organisationId: activeOrgIdSelector(state)
    }),
    dispatch => ({
      createGettingStarted: args => dispatch({
        ...args,
        dispatch,
        type: CREATE_GETTING_STARTED,
      })
    })
  ),
  withHandlers({
    onSelect: ({ userId, organisationId, createGettingStarted }) => () => {
      createGettingStarted({ userId, organisationId });
    }
  }),
);

const GettingStarted = enhance(TemplateCard);

export default GettingStarted;
