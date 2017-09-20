import { AutoComplete } from 'ui/components';
import { compose, withProps } from 'recompose';
import { Map } from 'immutable';

// Local filter state
const withFilterToValue = compose(
  withProps(({ onChangeFilter, onChange }) => ({
    onChangeFilter: (searchString) => {
      onChangeFilter(searchString);
      onChange(searchString);
    }
  }))
);

const valueToValues = withProps(({ value }) => ({
  values: new Map({
    [value]: new Map({
      searchString: value
    })
  })
}));

const onChangeToString = withProps(({ onChange, parseOption }) => ({
  onChange: value => onChange(parseOption(value.first()))
}));

const withMultiFalse = withProps({ multi: false });

export default compose(
  withFilterToValue,
  valueToValues,
  onChangeToString,
  withMultiFalse
)(AutoComplete);

// InputBox
//  onChangeSearchString
//   -> TextInput
//   -> TokenInput
//
// OptionList
//   options
//   optionCount
