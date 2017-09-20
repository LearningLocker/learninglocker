import React from 'react';
import { Map } from 'immutable';
import { compose, withProps } from 'recompose';
import { withSchema } from 'ui/utils/hocs';
import OptionListItem from 'ui/components/OptionListItem/OptionListItem';
import OptionList from '../OptionList/OptionList';

const renderOption =
  ({ parseOption, parseOptionTooltip }) =>
  ({ option = new Map(), onSelectOption }) => (
    <OptionListItem
      data={option}
      label={parseOption(option.get('value'))}
      tooltip={parseOptionTooltip(option.get('value'))}
      onClick={onSelectOption} />
);

const withCacheKeys = compose(
  withSchema('querybuildercachevalue'),
  withProps(({ models, modelCount, onSelectOption, parseOption, parseOptionTooltip }) => ({
    options: models.entrySeq().toList(),
    optionCount: modelCount,
    renderOption: renderOption({ parseOption, parseOptionTooltip }),
    onSelectOption: (option) => {
      onSelectOption(option.get('value'));
    },
  }))
);

export default withCacheKeys(OptionList);
