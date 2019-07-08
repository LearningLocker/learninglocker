import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'ui/components/Material/Switch';

/**
 * @param {boolean} props.sourceView
 * @param {(sourceView: boolean) => void} props.onChange
 */
const SourceViewForm = ({
  sourceView,
  onChange,
}) => (
  <div className="form-group">
    <Switch
      label="View as table"
      checked={sourceView}
      onChange={onChange} />
  </div>
);

SourceViewForm.propTypes = {
  sourceView: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(SourceViewForm);
