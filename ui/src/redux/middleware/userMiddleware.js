import { MERGE_ENTITIES } from 'ui/redux/modules/models';
import { Map } from 'immutable';

export default function userMiddleware() {
  return next => (action) => {
    if (action.type === MERGE_ENTITIES && action.models.has('user')) {
      const newModels = action.models.update('user', users => users.map((userProps) => {
        let nextProps = new Map(userProps);

        // Remove the password from the incoming models
        nextProps = nextProps.set('password', '');
        nextProps = nextProps.set('passwordConfirmation', '');
        return nextProps;
      }));
      return next({ ...action, models: newModels });
    }
    return next(action);
  };
}
