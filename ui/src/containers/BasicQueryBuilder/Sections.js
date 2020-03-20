import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import ExpandedSection from './ExpandedSection';
import CollapsedSection from './CollapsedSection';

export default class Sections extends Component {
  static propTypes = {
    timezone: PropTypes.string,
    orgTimezone: PropTypes.string.isRequired,
    sections: PropTypes.instanceOf(Map),
    criteria: PropTypes.instanceOf(Map),
    onCriteriaChange: PropTypes.func,
    onSectionsChange: PropTypes.func,
    onAddCriterion: PropTypes.func,
    onDeleteCriterion: PropTypes.func,
    onChangeTimezone: PropTypes.func,
  }

  shouldComponentUpdate = nextProps => !(
    this.props.timezone === nextProps.timezone &&
    this.props.orgTimezone === nextProps.orgTimezone &&
    this.props.sections.equals(nextProps.sections) &&
    this.props.criteria.equals(nextProps.criteria)
  );

  changeSectionProp = (key, prop, value) => {
    const collapsedSection = this.props.sections.get(key);
    const expandedSection = collapsedSection.set(prop, value);
    const updatedSections = this.props.sections.set(key, expandedSection);
    this.props.onSectionsChange(updatedSections);
  }

  changeSectionExpansion = (key, expanded) => {
    this.changeSectionProp(key, 'expanded', expanded);
  }

  expandSection = (key) => {
    this.changeSectionExpansion(key, new Date());
  }

  collapseSection = (key) => {
    this.changeSectionExpansion(key, false);
  }

  changeChildSections = (key, children) => {
    this.changeSectionProp(key, 'children', children);
  }

  getCriteriaForSection = (section, used = false) => {
    const sectionPath = section.get('keyPath', new List());
    const out = this.props.criteria.filter((value, key) => {
      const criteriaPath = key.get('criteriaPath', new List());
      if (used === false) {
        return criteriaPath.equals(sectionPath);
      }
      const matchChildGenerators = section.get('childGenerators', new List()).filter(
          generator => criteriaPath.slice(0, generator.get('path').size).equals(generator.get('path'))
        ).count();

      return criteriaPath.equals(sectionPath) || matchChildGenerators > 0;
    });
    return out;
  }

  getCriteriaForChildren = section =>
    section
      .get('children', new Map())
      .reduce((criteria, child) => criteria + this.getCriteriaForWholeSection(child), 0);

  getCriteriaForWholeSection = (section, used = false) => (
    this.getCriteriaForSection(section, used).count() +
    this.getCriteriaForChildren(section)
  );

  changeCriteria = (criteria) => {
    this.props.onCriteriaChange(this.props.criteria.merge(criteria));
  }

  renderSection = (section, key) => {
    if (section.get('expanded', false) === false) {
      return this.renderCollapsedSection(section, key);
    }
    return this.renderExpandedSection(section, key);
  }

  renderExpandedSection = (section, key) => (
    <ExpandedSection
      timezone={this.props.timezone}
      orgTimezone={this.props.orgTimezone}
      section={section}
      sectionCriteria={this.getCriteriaForSection(section)}
      key={key}
      criteria={this.props.criteria}
      onCriteriaChange={this.changeCriteria}
      onDeleteCriterion={this.props.onDeleteCriterion}
      onCollapse={this.collapseSection.bind(this, key)}
      onChildrenChange={this.changeChildSections.bind(this, key)}
      onAddCriterion={this.props.onAddCriterion}
      onChangeTimezone={this.props.onChangeTimezone} />
  );

  renderCollapsedSection = (section, key) => (
    <CollapsedSection
      used={this.getCriteriaForWholeSection(section, true) > 0}
      section={section}
      key={key}
      onExpand={this.expandSection.bind(this, key, section)} />
  );

  render = () => {
    const { sections, style, className } = this.props;

    return (
      <div className={className} style={style}>
        {
          sections
            .map(this.renderSection)
            .valueSeq()
        }
      </div>
    );
  }
}
