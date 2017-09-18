import { compose, defaultProps, withProps, withState } from 'recompose';
import { Map, fromJS } from 'immutable';

export default compose(
  defaultProps({ searchStringToFilter: (searchString) => {
    switch (searchString) {
      case '': return new Map();
      default: return fromJS({ searchString: { $regex: searchString, $options: 'i' } });
    }
  } }),
  withState('searchFilter', 'setSearchFilter'),
  withState('searchString', 'setSearchString', ''),
  withProps(({ setSearchFilter, searchStringToFilter, setSearchString }) => ({
    onChangeFilter: (searchString) => {
      setSearchFilter(searchStringToFilter(searchString));
      setSearchString(searchString);
    }
  })),
  withProps(({ filter = new Map(), searchFilter }) => ({
    filter: filter.merge(searchFilter)
  }))
);
