import React from 'react';
import { setModelQuery as setModelQueryAction, modelQueryStringSelector } from 'ui/redux/modules/search';
import { fetchModels } from 'ui/redux/modules/pagination';
import { connect } from 'react-redux';
import DebounceInput from 'react-debounce-input';
import { compose, withProps } from 'recompose';

const render = ({ searchString, setSearchString }) => (
  <form>
    <div className={'input-group'}>
      <DebounceInput
        debounceTimeout={377}
        placeholder="Search..."
        className="form-control"
        value={searchString}
        onChange={(event) => {
          event.preventDefault();
          setSearchString(event.target.value);
        }} />
      <div className="input-group-btn">
        {searchString !== '' &&
          <button
            className="btn btn-default"
            title="Clear"
            onClick={() =>
              setSearchString('')
            }>
            <i className="ion-close" />
          </button>
        }
      </div>
    </div>
  </form>
);

export default compose(
  connect((state, ownProps) => ({
    searchString: modelQueryStringSelector(ownProps.schema)(state) || ''
  }), { setModelQuery: setModelQueryAction, fetchModels }),
  withProps(({ setModelQuery, schema }) => ({
    setSearchString: queryString =>
      setModelQuery(schema, queryString)
  }))
)(render);
