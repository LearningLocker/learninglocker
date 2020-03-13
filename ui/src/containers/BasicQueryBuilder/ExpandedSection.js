import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import { List, Map } from 'immutable';
import { map, maxBy, merge, size } from 'lodash';
import decodeDot from 'lib/helpers/decodeDot';
import { getAvailableSection, operators } from 'ui/redux/modules/queryBuilder';
import { withModels } from 'ui/utils/hocs';
import {
  ExpandedSectionsContainer,
  ExpandedSectionWrapper,
  ExpandedTitle
} from 'ui/containers/BasicQueryBuilder/styled';
import DiscreteCriteria from './Discrete/Criteria';
import ActorDiscreteCriteria from './ActorDiscrete/Criteria';
import ContinuousCriteria from './Continuous/Criteria';
import RangeCriteria from './Range/Criteria';
import BooleanCriteria from './Boolean/Criteria';
import StringMatchesCriteria from './StringMatches/Criteria';

export const queryBuilderCacheFilterGenerator = ({ section }) => {
  let query;

  if (section.get('childGenerators', false)) {
    const childGenerators = section.get('childGenerators');

    const orQueryList = map(childGenerators.toJS(), (item) => {
      const keyPath = item.path;

      return merge(
        {},
        ...map(keyPath, (item2, index) =>
          ({ [`path.${index}`]: { $eq: item2 } })
        )
      );
    });

    const maxItem = maxBy(orQueryList, item => size(item));
    const maxSize = size(maxItem);

    query = { $and: [
      { $or: orQueryList },
      { path: { $size: (maxSize + 1) } }
    ] };
  } else if (section.has('keyPath')) {
    const andQuery = map(section.get('keyPath', new List()).toJS(), (item, index) =>
        ({ [`path.${index}`]: { $eq: item } })
      );

    query = { $and: [
      { $and: andQuery },
      { path: { $size: (size(andQuery) + 1) } }
    ] };
  }

  return { queryBuilderCacheFilter: query };
};

const withQueryBuilderCacheProps = withProps(
  queryBuilderCacheFilterGenerator
);

class ExpandedSection extends Component {
  static propTypes = {
    timezone: PropTypes.string,
    orgTimezone: PropTypes.string.isRequired,
    section: PropTypes.instanceOf(Map),
    sectionCriteria: PropTypes.instanceOf(Map),
    criteria: PropTypes.instanceOf(Map),
    onCriteriaChange: PropTypes.func,
    onDeleteCriterion: PropTypes.func,
    onCollapse: PropTypes.func,
    onChildrenChange: PropTypes.func,
    onAddCriterion: PropTypes.func,
  }

  shouldComponentUpdate = (nextProps) => {
    const out = !(
      this.props.timezone === nextProps.timezone &&
      this.props.orgTimezone === nextProps.orgTimezone &&
      this.props.section.equals(nextProps.section) &&
      this.props.criteria.equals(nextProps.criteria) &&
      this.props.models.equals(nextProps.models)
    );

    return out;
  }

  collapseSection = (event) => {
    event.preventDefault();
    this.props.onCollapse();
  }

  renderContinuousCriteria = () => (
    <ContinuousCriteria
      timezone={this.props.timezone}
      orgTimezone={this.props.orgTimezone}
      section={this.props.section}
      criteria={this.props.sectionCriteria}
      onCriteriaChange={this.props.onCriteriaChange}
      onAddCriterion={this.props.onAddCriterion}
      onDeleteCriterion={this.props.onDeleteCriterion} />
  );

  renderRangeCriteria = () => (<RangeCriteria
    section={this.props.section}
    criteria={this.props.sectionCriteria}
    onCriteriaChange={this.props.onCriteriaChange}
    onAddCriterion={this.props.onAddCriterion}
    onDeleteCriterion={this.props.onDeleteCriterion} />
    )

  renderBooleanCriteria = () => (<BooleanCriteria
    section={this.props.section}
    criteria={this.props.sectionCriteria}
    onCriteriaChange={this.props.onCriteriaChange}
    onDeleteCriterion={this.props.onDeleteCriterion} />
    )

  renderStringMatchesCriteria = () => (<StringMatchesCriteria
    section={this.props.section}
    criteria={this.props.sectionCriteria}
    onCriteriaChange={this.props.onCriteriaChange}
    onAddCriterion={this.props.onAddCriterion}
    onDeleteCriterion={this.props.onDeleteCriterion} />
    )

  renderDiscreteCriteria = () => (<DiscreteCriteria
    section={this.props.section}
    criteria={this.props.sectionCriteria}
    onCriteriaChange={this.props.onCriteriaChange}
    onAddCriterion={this.props.onAddCriterion}
    onDeleteCriterion={this.props.onDeleteCriterion} />
    )

  renderActorDiscreteCriteria = () => (<ActorDiscreteCriteria
    section={this.props.section}
    criteria={this.props.sectionCriteria}
    onCriteriaChange={this.props.onCriteriaChange}
    onAddCriterion={this.props.onAddCriterion}
    onDeleteCriterion={this.props.onDeleteCriterion} />
    )

  renderCriteria = () => {
    const ops = this.props.section.get('operators');
    switch (ops) {
      case operators.CONTINUOUS: return this.renderContinuousCriteria();
      case operators.RANGE:
      // Shows both the range (number) picker and the dropdown picker
        return (
          <div>
            { this.renderRangeCriteria() }
            { this.renderDiscreteCriteria() }
          </div>
        );
      case operators.BOOLEAN: return this.renderBooleanCriteria();
      case operators.STRING_MATCHES: return this.renderStringMatchesCriteria();
      case operators.OR_DISCRETE: return this.renderActorDiscreteCriteria();
      default: return this.renderDiscreteCriteria();
    }
  };

  render = () => {
    const { section } = this.props;
    const title = decodeDot(section.get('title', ''));
    const children = section.get('children', new Map());
    const hasCriteria = section.has('operators');

    return (
      <ExpandedSectionWrapper>
        <ExpandedTitle onClick={this.collapseSection}>
          <i className="ion-minus-round" /> {title}
        </ExpandedTitle>
        {
          hasCriteria && <div style={{ marginTop: 10 }}>
            {this.renderCriteria()}
          </div>
        }
        {
          children.size > 0 &&
          <ExpandedSectionsContainer
            timezone={this.props.timezone}
            orgTimezone={this.props.orgTimezone}
            sections={children}
            criteria={this.props.criteria}
            onCriteriaChange={this.props.onCriteriaChange}
            onSectionsChange={this.props.onChildrenChange}
            onAddCriterion={this.props.onAddCriterion}
            onDeleteCriterion={this.props.onDeleteCriterion} />
        }
      </ExpandedSectionWrapper>
    );
  }
}

export default compose(
  withQueryBuilderCacheProps,
  connect((state, {
    queryBuilderCacheFilter,
    section
  }) => {
    const availableSection = getAvailableSection(
      section,
      queryBuilderCacheFilter
    )(state);

    return { section: section.mergeDeep(availableSection) };
  }, {}),
  withProps(({ queryBuilderCacheFilter }) => ({
    schema: 'querybuildercache',
    filter: queryBuilderCacheFilter,
    first: 1000
  })),
  withModels
)(ExpandedSection);
