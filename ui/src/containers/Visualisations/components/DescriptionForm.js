import React from 'react';
import PropTypes from 'prop-types';

/**
 * @param {string} props.visualisationId
 * @param {string} props.description
 * @param {(description: string) => void} props.onChange
 */
const DescriptionForm = ({
  visualisationId,
  description,
  onChange,
}) => {
  const formId = `visualisation-description-${visualisationId}`;
  return (
    <div className="form-group">
      <label htmlFor={formId}>
        Name
      </label>

      <input
        id={formId}
        className="form-control"
        placeholder="What does this visualisation show?"
        value={description}
        onChange={e => onChange(e.target.value)} />
    </div>
  );
};

DescriptionForm.propTypes = {
  visualisationId: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(DescriptionForm);
