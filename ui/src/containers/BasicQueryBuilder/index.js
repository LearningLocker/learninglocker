import React from 'react';
import PropTypes from 'prop-types';
import { compose, setPropTypes, defaultProps, shouldUpdate } from 'recompose';
import { Map, List } from 'immutable';
import { changeCriteria, deleteCriterion, addCriterionFromSection, getCriteria } from 'ui/utils/queries';
import QueryBuilderSections from 'ui/containers/BasicQueryBuilder/QueryBuilderSections';

const enhance = compose(
  setPropTypes({
    componentPath: PropTypes.instanceOf(List),
    timezone: PropTypes.string,
    orgTimezone: PropTypes.string.isRequired,
    query: PropTypes.instanceOf(Map),
    defaults: PropTypes.instanceOf(Map),
    onQueryChange: PropTypes.func,
  }),
  defaultProps({
    query: new Map(),
  }),
  shouldUpdate((prev, next) => !(
    prev.timezone === next.timezone &&
    prev.orgTimezone === next.orgTimezone &&
    prev.query.equals(next.query)
  ))
);

const BasicQueryBuilder = ({ componentPath, timezone, orgTimezone, defaults, query, onQueryChange }) => {
  const criteria = getCriteria(query);

  return (
    <QueryBuilderSections
      timezone={timezone}
      orgTimezone={orgTimezone}
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

export default enhance(BasicQueryBuilder);
