import React from 'react';
import Portal from 'react-portal';
import { compose, withHandlers } from 'recompose';
import { withModel } from 'ui/utils/hocs';

const enhance = compose(
  withModel,
  withHandlers({
    togglePrivacy: ({ model, updateModel, onClickClose }) => (event) => {
      const value = !model.get('isPublic', false);
      updateModel({ path: ['isPublic'], value });
      onClickClose();
      event.stopPropagation();
    }
  })
);

const render = ({ isOpened, togglePrivacy, onClickClose, model }) => {
  const isPublic = model.get('isPublic', false);

  return (
    <Portal isOpened={isOpened}>
      <span>
        <div className="modal animated fast fadeIn">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header modal-header-bg">
                <button type="button" className="close" aria-label="Close" onClick={onClickClose}>
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 className="modal-title">
                  <span>
                      Confirm
                      {isPublic
                        ? <span> Set to Private</span>
                        : <span> Set to Public</span>}
                  </span>
                </h4>
              </div>

              <div
                className="modal-body clearfix"
                style={{ maxHeight: '500px', overflow: 'auto', textAlign: 'center' }}>
                {isPublic
                    ? <span>This will hide the dashboard for others in your organisations. Are you sure?</span>
                    : <span>This will show the dashboard to others in your organisations. Are you sure?</span>}
              </div>

              <div className="modal-footer" style={{ textAlign: 'center' }}>
                <a
                  onClick={togglePrivacy}
                  className="btn btn-primary btn-sm">
                  <i className="icon ion-checkmark" /> Confirm
                    </a>
                <a
                  onClick={onClickClose}
                  className="btn btn-primary btn-sm">
                  <i className="icon ion-close-round" /> Cancel
                    </a>
              </div>
            </div>
          </div>
          <div className="modal-backdrop" onClick={onClickClose.bind(null)} />
        </div>
      </span>
    </Portal>
  );
};

export default enhance(render);
