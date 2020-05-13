import React from 'react';
import PropTypes from 'prop-types';

/**
 * @param {string} props.visualisationId
 * @param {string} propscontextLabel
 * @param {(contextLabel: string) => void} props.onChange
 */
const ContextLabelForm = ({
  visualisationId,
  contextLabel,
  onChange,
}) => {
  const formId = `visualisation-contextLabel-${visualisationId}`;

  return (
    <div className="form-group">
      <label htmlFor={formId}>
        Counter description
      </label>

      <input
        id={formId}
        className="form-control"
        placeholder="Comment"
        maxLength={30}
        value={contextLabel}
        onChange={e => onChange(e.target.value)} />
    </div>
  );
};

ContextLabelForm.propTypes = {
  visualisationId: PropTypes.string.isRequired,
  contextLabel: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(ContextLabelForm);
