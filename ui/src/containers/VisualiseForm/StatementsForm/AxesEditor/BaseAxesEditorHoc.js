import { withProps, compose, withHandlers } from 'recompose';
import { VISUALISE_AXES_PREFIX } from 'lib/constants/visualise';
import { is } from 'immutable';

const BaseAxesEditorHoc =
  compose(
    withProps(({ model, updateModel }) => ({
      getAxesValue: (key, notSetValue) => {
        const value = model.get(VISUALISE_AXES_PREFIX + key, notSetValue);
        return value;
      },
      changeAxes: (key, value) => {
        const modelId = model.get('_id');

        if (is(model.get(VISUALISE_AXES_PREFIX + key), value)) {
          // Don't update if new value is same as old value
          return;
        }
        updateModel({
          schema: 'visualisation',
          id: modelId,
          path: VISUALISE_AXES_PREFIX + key,
          value
        });
      }
    })),
    withHandlers(({
      handleAxesChange: ({ changeAxes }) =>
        key => event => changeAxes(key, event.target.value)
    })
  )
);

export default BaseAxesEditorHoc;
