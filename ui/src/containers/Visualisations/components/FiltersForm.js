import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Tab } from 'react-toolbox/lib/tabs';
import Tabs from 'ui/components/Material/Tabs';
import FilterForm from './FilterForm';

const NoFilters = () => <span />;

/**
 * @param {string} props.visualisationId
 * @param {immutable.List} props.filters
 * @param {string|undefined|null} props.timezone
 * @param {string} props.orgTimezone
 * @param {(filters: immutable.List) => void} props.onChange
 */
const MultipleFilters = ({
  visualisationId,
  filters,
  timezone,
  orgTimezone,
  onChange,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Tabs
      index={tabIndex}
      onChange={setTabIndex}>
      {filters.map((filter, i) => (
        <Tab
          key={i}
          label={filter.get('label') || `Series ${i + 1}`}>
          <FilterForm
            visualisationId={visualisationId}
            index={i}
            filter={filters.get(i)}
            canEditLabel
            timezone={timezone}
            orgTimezone={orgTimezone}
            onChange={newFilter => onChange(filters.set(i, newFilter))}
            onDelete={() => {
              setTabIndex(0);
              onChange(filters.delete(i));
            }} />
        </Tab>
      ))}
    </Tabs>
  );
};

/**
 * @param {string} props.visualisationId
 * @param {immutable.List} props.filters
 * @param {boolean} props.canEditLabel
 * @param {string|undefined|null} props.timezone
 * @param {string} props.orgTimezone
 * @param {(filters: immutable.List) => void} props.onChange
 */
const FiltersFormContents = ({
  visualisationId,
  filters,
  canEditLabel,
  timezone,
  orgTimezone,
  onChange,
}) => {
  if (filters.size === 0) {
    return <NoFilters />;
  }

  // No tabs when the size of filters is one.
  if (filters.size === 1) {
    return (
      <FilterForm
        visualisationId={visualisationId}
        index={0}
        filter={filters.get(0)}
        canEditLabel={canEditLabel}
        timezone={timezone}
        orgTimezone={orgTimezone}
        onChange={filter => onChange(filters.set(0, filter))}
        onDelete={() => onChange(filters.delete(0))} />
    );
  }

  return (
    <MultipleFilters
      visualisationId={visualisationId}
      filters={filters}
      timezone={timezone}
      orgTimezone={orgTimezone}
      onChange={onChange} />
  );
};

/**
 * @param {string} props.visualisationId
 * @param {immutable.List} props.filters
 * @param {boolean} props.canEditLabel - can edit the label even if the size of filters is 1
 * @param {string} props.orgTimezone
 * @param {(filters: immutable.List) => void} props.onChange
 */
const FiltersForm = ({
  visualisationId,
  filters,
  canEditLabel,
  timezone,
  orgTimezone,
  onChange,
}) => {
  const formId = `visualisation-filters-form-${visualisationId}`;

  return (
    <div className="form-group">
      <label htmlFor={formId}>
        Build your query
      </label>

      <FiltersFormContents
        visualisationId={visualisationId}
        filters={filters}
        canEditLabel={canEditLabel}
        timezone={timezone}
        orgTimezone={orgTimezone}
        onChange={onChange} />
    </div>
  );
};

FiltersForm.propTypes = {
  visualisationId: PropTypes.string.isRequired,
  filters: PropTypes.instanceOf(List),
  canEditLabel: PropTypes.bool.isRequired,
  timezone: PropTypes.string,
  orgTimezone: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(FiltersForm);
