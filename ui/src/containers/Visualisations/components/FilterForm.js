import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import DebounceInput from 'react-debounce-input';
import ColorPicker from 'ui/components/ColorPicker';
import QueryBuilder from 'ui/containers/QueryBuilder';
import { VISUALISATION_COLORS } from 'ui/utils/constants';

/**
 * @param {string} props.visualisationId
 * @param {number} props.index
 * @param {immutable.Map} props.filter
 *   - filter should have keys, "$match", "label" (optional) , and "color" (optional).
 * @param {boolean} props.canEditLabel
 *   - show edit label form and delete icon
 * @param {string|undefined|null} props.timezone
 * @param {string} props.orgTimezone
 * @param {immutable.List} componentBasePath
 * @param {(filter: immutable.Map) => void} props.onChange
 * @param {() => void} props.onDelete
 */
const FilterForm = ({
  visualisationId,
  index,
  filter,
  canEditLabel,
  timezone,
  orgTimezone,
  onChange,
  onDelete,
}) => {
  const formId = `visualisation-filter-form-${visualisationId}`;

  return (
    <div>
      {
        canEditLabel && (
          <div className="form-group">
            <label htmlFor={formId}>
              Label
            </label>

            <span
              onClick={onDelete}
              title="Delete"
              className="btn-sm btn pull-right">
              <i className="icon ion-trash-b" />
            </span>

            <DebounceInput
              id={formId}
              debounceTimeout={377}
              className="form-control"
              value={filter.get('label') || `Series ${index + 1}`}
              onChange={e => onChange(filter.set('label', e.target.value))} />
          </div>
        )
      }

      <div className="form-group">
        <QueryBuilder
          timezone={timezone}
          orgTimezone={orgTimezone}
          componentPath={new List(['visualise', visualisationId, index])}
          query={filter.get('$match', new Map())}
          onChange={query => onChange(filter.set('$match', query))} />
      </div>

      <div className="form-group">
        <ColorPicker
          color={filter.get('color', VISUALISATION_COLORS[index])}
          onChangeHashToForceRender={filter.hashCode()}
          onChange={color => onChange(filter.set('color', color.hex))} />
      </div>
    </div>
  );
};

FilterForm.propTypes = {
  visualisationId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  filter: PropTypes.instanceOf(Map),
  canEditLabel: PropTypes.bool.isRequired,
  timezone: PropTypes.string,
  orgTimezone: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default React.memo(FilterForm);
