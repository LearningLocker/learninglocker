import React from 'react';
import ModelOptionList from 'ui/components/AutoComplete2/Options/ModelOptionList/ModelOptionList';
import SingleInput from 'ui/components/AutoComplete2/Inputs/SingleInput/SingleInput';
import AutoComplete2 from 'ui/components/AutoComplete2';
import OptionListItem from 'ui/components/OptionListItem';
import languageResolver from 'ui/utils/languageResolver';
import { Map } from 'immutable';

const renderOption = ({
  useTooltip = false,
  onFocus = () => {},
}) => ({
  option = new Map(),
  onSelectOption = () => {}
}) => {
  // const out = (
  //   <OptionListItem
  //     data={option}
  //     label={option.get('searchString')}
  //     tooltip={useTooltip ? option.get('searchString') : null}
  //     onClick={(event) => {
  //       onFocus(event);
  //       onSelectOption(event);
  //     }} />
  // );
  const out = (
    <OptionListItem
      data={option}
      label={option}
      tooltip={useTooltip ? option : null}
      onClick={(event) => {
        onFocus(event);
        onSelectOption(event);
      }} />
  );
  return out;
};

const fullActivitiesList = ({
  useTooltip,
  onSelectOption,
  selectedOption,
  setSearchString
}) => {
  const searchString = '';

  selectedOption = 'test';

  const out = (
    <div>
      <AutoComplete2
        renderInput={({ hasFocus, onFocus }) => {
          const ou = (
            <SingleInput
              hasFocus={hasFocus}
              hasInputFocus={hasFocus}
              onFocus={onFocus}
              searchString={searchString}
              parseOption={option => option}
              renderOption={renderOption({ useTooltip, onFocus })}
              onChangeSearchString={(e) => {
                const o = setSearchString(e.target.value);
                return o;
              }}
              placeholder={'Select a Course'}
              selectedOption={selectedOption} />
          );

          return ou;
        }}
        renderOptions={() => {
          const ou = (
            <ModelOptionList
              filter={{}}
              onSelectOption={onSelectOption}
              parseOption={(option) => {
                const o = (option ? languageResolver(option.get('name', new Map())) : '');
                return o;
              }}
              parseOptionTooltip={option => (option ? option.get('activityId') : '')}
              schema={'fullActivities'}
              canEdit={() => false}
              canAdd={() => false} />
          );
          return ou;
        }}
      />
    </div>
  );

  return out;
};

export default fullActivitiesList;
