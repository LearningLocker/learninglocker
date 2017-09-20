import React from 'react';
import AutoComplete2 from 'ui/components/AutoComplete2';
import QueryBuilderInput from
  'ui/components/AutoComplete2/Inputs/MultiInput/QueryBuilderInput';
import ModelOptionList from
  'ui/components/AutoComplete2/Options/ModelOptionList/ModelOptionList';
import { Map } from 'immutable';
import { compose, withProps, withState } from 'recompose';
// import * as schemas from 'ui/utils/schemas';

// const withEditableFields = withProps(({ schema, editableFields }) => {
//   if (editableFields) return { editableFields };
//   const modelSchema = schemas[schema];
//   const defaultFields = (modelSchema && modelSchema.editableFields) || ['name'];
//   return { editableFields: defaultFields };
// });

// takes the existing query values and uses them to construct a query
// merges that with the existing filter
const withValuesFilter = compose(
  withProps(({ values, filter }) => {
    if (values.isEmpty()) return { valuesFilter: new Map({ _id: null }) };

    const inFilter = new Map({
      $or: values
    });
    const outFilter = new Map({
      $nor: values
    });

    return { valuesFilter: inFilter.merge(filter), notValuesFilter: outFilter };
  })
);

// stores a filter based on search input, merges it with any existing filters
const withSearchFilter = compose(
  withState('searchFilter', 'setSearchFilter'),
  withProps(({ filter = new Map(), searchFilter = new Map(), notValuesFilter }) => ({
    filter: filter.mergeDeep(searchFilter).mergeDeep(notValuesFilter)
  }))
);

export default compose(
  // withEditableFields,
  withValuesFilter,
  withSearchFilter
)(({
  schema,
  filter,
  values,
  setSearchFilter,
  selectOption,
  deselectOption,
  parseOption,
  parseOptionTooltip,
  searchStringToFilter,
  valuesFilter
}) =>
  (<AutoComplete2
    renderInput={({ hasFocus }) => (
      <QueryBuilderInput
        filter={valuesFilter}
        values={values}
        first={1000}
        parseOption={option => (option ? parseOption(option) : '')}
        parseOptionTooltip={option => (option ? parseOption(option) : '')}
        schema={schema}
        deselectOption={deselectOption}
        hasFocus={hasFocus}
        searchStringToFilter={searchStringToFilter}
        onChangeFilter={searchFilter => setSearchFilter(searchFilter)} />
    )}
    renderOptions={() => (
      <ModelOptionList
        onSelectOption={selectOption}
        parseOption={option => (option ? parseOption(option) : '')}
        parseOptionTooltip={option => (option ? parseOptionTooltip(option) : '')}
        filter={filter}
        first={1000}
        canEdit={() => false}
        schema={schema} />
    )} />
  )
);
