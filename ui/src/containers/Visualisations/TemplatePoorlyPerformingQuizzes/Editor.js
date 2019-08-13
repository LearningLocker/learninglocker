import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import PreviewPeriodPicker from '../components/PreviewPeriodPicker';
import Viewer from './Viewer';

 /**
 * @param {immutable.Map} props.model - visualisation model
 * @param {(args: object) => void} props.updateModel
 */
const Editor = ({
  model,
  updateModel,
}) => {
  const id = model.get('_id');

  const onChangePreviewPeriod = useCallback((previewPeriod) => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'previewPeriod',
      value: previewPeriod,
    });
  }, [id]);

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="form-group form-inline" style={{ textAlign: 'right' }}>
          <PreviewPeriodPicker
            visualisationId={id}
            previewPeriod={model.get('previewPeriod')}
            onChange={onChangePreviewPeriod} />
        </div>

        <div style={{ height: '400px', paddingTop: 5 }}>
          <Viewer
            visualisationId={id}
            showSourceView={model.get('sourceView')} />
        </div>
      </div>
    </div>
  );
};

Editor.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  updateModel: PropTypes.func.isRequired,
};

export default Editor;
