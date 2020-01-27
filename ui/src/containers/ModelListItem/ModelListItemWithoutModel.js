import {
  withProps,
  compose
} from 'recompose';
import {
  getMetadataSelector,
  setInMetadata
} from 'ui/redux/modules/metadata';
import { connect } from 'react-redux';
import { ModelListItem } from './index';

// Doesn't use the with model hoc, uses the raw immutable js model.

const stateProps = withProps(({
  setInMetadata: setInMetadataProp,
  schema,
  id,
  metadata,
}) => ({
  setMetadata: (key, value) => {
    setInMetadataProp({
      schema,
      id,
      path: [key],
      value
    });
  },
  getMetadata: (key, defaultValue) =>
    metadata.get(key, defaultValue)
}));

export default compose(
  withProps(({ model }) => ({
    id: model.get('_id')
  })),
  connect(
    (state, { schema, id }) =>
      ({
        metadata: getMetadataSelector({ schema, id })(state)
      }),
    {
      setInMetadata
    }
  ),
  stateProps,
)(ModelListItem);
