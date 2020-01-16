import { connect } from 'react-redux';
import { withProps, compose, withHandlers } from 'recompose';
import { loggedInUserId } from 'ui/redux/modules/auth';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import { CREATE_CURATR_STARTER } from 'ui/redux/modules/dashboard/curatrStarter';
import iconImage from './assets/curatr-starter.png';
import TemplateCard from './TemplateCard';

const enhance = compose(
  withProps({
    title: 'Curatr Starter',
    image: iconImage,
  }),
  connect(
    state => ({
      userId: loggedInUserId(state),
      organisationId: activeOrgIdSelector(state)
    }),
    dispatch => ({
      createCuratrStarter: ({ userId, organisationId }) => dispatch({
        dispatch,
        type: CREATE_CURATR_STARTER,
        userId,
        organisationId,
      })
    })
  ),
  withHandlers({
    onSelect: ({ userId, organisationId, createCuratrStarter }) => () => {
      createCuratrStarter({ userId, organisationId });
    }
  }),
);

const CuratrStarter = enhance(TemplateCard);

export default CuratrStarter;
