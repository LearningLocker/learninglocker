import React from 'react';
import PropTypes from 'prop-types';

/**
 * @param {() => void} props.onClick
 */
const AddQueryButton = ({
  onClick,
}) => (
  <div className="form-group">
    <button
      className="btn btn-primary btn-sm"
      onClick={onClick} >

      <i className="ion ion-plus" style={{ marginRight: '4px' }} />
      Add query
    </button>
  </div>
);

AddQueryButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default React.memo(AddQueryButton);
