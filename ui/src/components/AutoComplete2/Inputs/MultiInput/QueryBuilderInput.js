import React from 'react';
import { Map, fromJS, Iterable } from 'immutable';
import { connect } from 'react-redux';
import { compose, withProps, defaultProps } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import MultiInput from 'ui/components/AutoComplete2/Inputs/MultiInput/MultiInput';
import Token from 'ui/components/AutoComplete2/Inputs/MultiInput/Token/Token';
import { modelsByFilterSelector } from 'ui/redux/modules/models';

const convertPathToKeys = path =>
  path.split('.');

const setValueAtPath = (model, value, path) =>
  model.setIn(convertPathToKeys(path), value);

const convertValueToModel = map =>
  map.reduce(setValueAtPath, new Map());

const removeObjectId = value =>
  (Iterable.isIterable(value) ? value.get('$oid', value) : value);

const isEqAtPath = model => (value, path) =>
  model.getIn(convertPathToKeys(path)) === removeObjectId(value);

const isValueNotEqModel = value => model =>
  value.size !== value.takeWhile(isEqAtPath(model)).size;

const getModelByValue = models => value =>
  models.skipWhile(isValueNotEqModel(value)).first() || convertValueToModel(value);

const convertValuesToModel = values => models =>
  values.map(getModelByValue(models));

const withLoadedOptions = connect((state, { schema }) => ({
  loadedModels: modelsByFilterSelector(schema)(state)
}));

const withSelectedOptions = withProps(({ models, values, loadedModels }) => ({
  selectedOptions: models.size > 0 ? models : convertValuesToModel(values)(loadedModels)
}));

const defaultSearchStringToFilter = (searchString) => {
  switch (searchString) {
    case '': return new Map();
    default: return fromJS({ searchString: { $regex: searchString, $options: 'i' } });
  }
};

const withSearchStringToFilter = defaultProps({
  searchStringToFilter: defaultSearchStringToFilter
});

const withOnChangeSearchString = withProps(({ onChangeFilter, searchStringToFilter }) => ({
  onChangeSearchString: (e) => {
    const searchString = e.target.value;
    const filter = searchStringToFilter(searchString);
    onChangeFilter(filter);
  }
}));

const withRenderOption = withProps(
  ({ parseOption, parseOptionTooltip, deselectOption }) => ({
    renderOption: ({ option, key }) => (
      <Token
        index={key}
        handleRemove={deselectOption}
        key={key}
        parse={parseOption}
        parseTooltip={parseOptionTooltip}
        value={option} />
    )
  })
);

export default compose(
  withSearchStringToFilter,
  withOnChangeSearchString,
  withModels,
  withRenderOption,
  withLoadedOptions,
  withSelectedOptions
)(MultiInput);
