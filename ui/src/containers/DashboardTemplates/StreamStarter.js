import { connect } from 'react-redux';
import { withProps, compose, withHandlers } from 'recompose';
import { loggedInUserId } from 'ui/redux/modules/auth';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import { CREATE_STREAM_STARTER } from 'ui/redux/modules/dashboard/streamStarter';
import iconImage from './assets/stream-starter.png';
import TemplateCard from './TemplateCard';

const enhance = compose(
  withProps({
    title: 'Stream Starter',
    image: iconImage,
  }),
  connect(
    state => ({
      userId: loggedInUserId(state),
      organisationId: activeOrgIdSelector(state)
    }),
    dispatch => ({
      createStreamStarter: ({ userId, organisationId }) => dispatch({
        dispatch,
        type: CREATE_STREAM_STARTER,
        userId,
        organisationId,
      })
    })
  ),
  withHandlers({
    onSelect: ({ userId, organisationId, createStreamStarter }) => () => {
      createStreamStarter({ userId, organisationId });
    }
  }),
);

const StreamStarter = enhance(TemplateCard);

export default StreamStarter;
