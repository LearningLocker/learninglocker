import React, { PropTypes } from 'react';
import { compose, setPropTypes, defaultProps, shouldUpdate } from 'recompose';
import { Map, List } from 'immutable';
import { changeCriteria, deleteCriterion, addCriterionFromSection, getCriteria } from 'ui/utils/queries';
import QueryBuilderSections from './QueryBuilderSections';

const enhance = compose(
  setPropTypes({
    componentPath: PropTypes.instanceOf(List),
    query: PropTypes.instanceOf(Map),
    defaults: PropTypes.instanceOf(Map),
    onQueryChange: PropTypes.func,
  }),
  defaultProps({
    query: new Map(),
  }),
  shouldUpdate((prev, next) => !(
    prev.query.equals(next.query)
  ))
);

const render = ({ componentPath, defaults, query, onQueryChange }) => {
  const criteria = getCriteria(query);
  return (
    <QueryBuilderSections
      componentPath={componentPath}
      criteria={criteria}
      defaults={defaults}
      onCriteriaChange={newCriteria =>
        onQueryChange(changeCriteria(newCriteria))
      }
      onAddCriterion={(criterion, section) =>
        onQueryChange(addCriterionFromSection(query, criterion, section))
      }
      onDeleteCriterion={key => onQueryChange(deleteCriterion(criteria, key))} />
  );
};

export default enhance(render);
