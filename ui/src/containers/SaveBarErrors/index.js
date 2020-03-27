import React from 'react';
import { compose, withHandlers } from 'recompose';
import { connect } from 'react-redux';
import { getAlertsSelector, deleteAlert } from 'ui/redux/modules/alerts';
import styled from 'styled-components';

const SaveBarErrorsContainer = styled.div`
  top: 2.4rem;
  position: absolute;
  right: 30px;
  left: 25px;
`;

const onRemove = ({ deleteAlert: deleteAlert2 }) => key => () => deleteAlert2({ key });

const SaveBarErrors = ({
  onRemove: onRemove2,
  alerts,
}) => (
  <SaveBarErrorsContainer>
    {
      alerts
        .map(
          (message, key) =>
            <div className="alert alert-danger alert-dismissible" role="alert" key={key}>
              <button onClick={onRemove2(key)} type="button" className="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              {message.message}
            </div>
        )
    }
  </SaveBarErrorsContainer>
);

const SaveBarErrorsComposed = compose(
  connect(
    state => ({
      alerts: getAlertsSelector(state)
    }),
    {
      deleteAlert
    }
  ),
  withHandlers({
    onRemove
  })
)(SaveBarErrors);

export default SaveBarErrorsComposed;
