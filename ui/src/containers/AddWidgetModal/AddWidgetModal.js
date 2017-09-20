import React from 'react';
import Portal from 'react-portal';

export default ({ isOpened, onClickClose }) => {
  const styles = require('./addwidgetmodal.css');

  return (
    <Portal closeOnEsc isOpened={isOpened}>
      <div className="modal">
        <div className="transparent-backdrop" onClick={onClickClose} />
        <div className="modal-dialog" role="document">
          <div className="modal-content">

            <div className="modal-header modal-header-bg">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
              <h4 className="modal-title" style={{ color: 'white' }}>
                    Available Visualisations
              </h4>
            </div>

            <div className="modal-body clearfix">
              <div className="row">

                <div className="col-md-4">
                  <div className={styles['available-widget']}>
                    <span><i className="ion ion-stats-bars" /></span>
                        Leaderboard
                  </div>
                </div>

                <div className="col-md-4">
                  <div className={styles['available-widget']}>
                    <span><i className="ion ion-stats-bars" /></span>
                        Most popular verbs
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="available-widget active">
                    <span><i className="ion ion-stats-bars" /></span>
                        Testing if this has a long title
                  </div>
                </div>

              </div>

              <div className="row">

                <div className="col-md-4">
                  <div className={styles['available-widget']}>
                    <span><i className="ion ion-stats-bars" /></span>
                        Leaderboard
                  </div>
                </div>

                <div className="col-md-4">
                  <div className={styles['available-widget']}>
                    <span><i className="ion ion-stats-bars" /></span>
                        Most popular verbs
                  </div>
                </div>

                <div className="col-md-4">
                  <div className={`${styles['available-widget']} active`}>
                    <span><i className="ion ion-stats-bars" /></span>
                        Testing if this has a long title
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};
