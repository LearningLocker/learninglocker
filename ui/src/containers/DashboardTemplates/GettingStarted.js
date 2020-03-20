import { connect } from 'react-redux';
import { withProps, compose, withHandlers } from 'recompose';
import { loggedInUserId } from 'ui/redux/modules/auth';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import { CREATE_GETTING_STARTED } from 'ui/redux/modules/dashboard/gettingStarted';
import iconImage from './assets/getting-started.png';
import TemplateCard from './TemplateCard';

const enhance = compose(
  withProps({
    title: 'Getting Started',
    image: iconImage,
  }),
  connect(
    state => ({
      userId: loggedInUserId(state),
      organisationId: activeOrgIdSelector(state)
    }),
    dispatch => ({
      createGettingStarted: ({ userId, organisationId }) => dispatch({
        dispatch,
        type: CREATE_GETTING_STARTED,
        userId,
        organisationId,
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
