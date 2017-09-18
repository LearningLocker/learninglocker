import { withModel } from 'ui/utils/hocs';
import { withProps, compose } from 'recompose';

/**
 * attaches an owner attribute to a component
 * @param {function} getOwnerId - function to get the owner id from the component's props
 *                              - defaults to ({ ownerId }) => ownerId
 */
const getOwnerIdDefault = ({ ownerId }) => ownerId;

export default ({ getOwnerId = getOwnerIdDefault }) => compose(
  withProps(ownProps => ({ id: getOwnerId(ownProps) })),
  withModel
);
