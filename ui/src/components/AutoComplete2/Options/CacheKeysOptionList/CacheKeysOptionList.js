import React from 'react';
import { Map, List } from 'immutable';
import { compose, withProps } from 'recompose';
import { withSchema } from 'ui/utils/hocs';
import OptionListItem from 'ui/components/OptionListItem';
import OptionList from '../OptionList/OptionList';

const renderOption = ({ parseTooltip }) => ({ option = new Map(), onSelectOption }) =>
  (<OptionListItem
    data={option}
    label={option.get('searchString')}
    onClick={onSelectOption}
    tooltip={parseTooltip && parseTooltip(option)} />);

// example option
// ['object.id', new Map({ searchString: 'HELLO' })],
const manualOptions = new List([
]);

const withCacheKeys = compose(
  withSchema('querybuildercache'),
  withProps(({ models, modelCount, onSelectOption, parseTooltip }) => ({
    options: models.entrySeq().toList().concat(manualOptions),
    optionCount: modelCount + manualOptions.size,
    renderOption: renderOption({ parseTooltip }),
    onSelectOption: (option) => {
      onSelectOption(option.get('searchString'));
    },
  }))
);

export default withCacheKeys(OptionList);
