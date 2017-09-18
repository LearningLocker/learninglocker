import React, { Component, PropTypes } from 'react';
import { Map, List } from 'immutable';
import ExpandedSection from './ExpandedSection';
import CollapsedSection from './CollapsedSection';

export default class Sections extends Component {
  static propTypes = {
    sections: PropTypes.instanceOf(Map),
    criteria: PropTypes.instanceOf(Map),
    onCriteriaChange: PropTypes.func,
    onSectionsChange: PropTypes.func,
    onAddCriterion: PropTypes.func,
    onDeleteCriterion: PropTypes.func,
  }

  shouldComponentUpdate = nextProps => !(
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

  getCriteriaForSection = (section) => {
    const sectionPath = section.get('keyPath', new List());
    const out = this.props.criteria.filter((value, key) => {
      const criteriaPath = key.get('criteriaPath', new List());
      return criteriaPath.equals(sectionPath);
    });
    return out;
  }

  getCriteriaForChildren = section =>
    section
      .get('children', new Map())
      .reduce((criteria, child) => criteria + this.getCriteriaForWholeSection(child), 0);

  getCriteriaForWholeSection = section => (
    this.getCriteriaForSection(section).count() +
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
      section={section}
      sectionCriteria={this.getCriteriaForSection(section)}
      key={key}
      criteria={this.props.criteria}
      onCriteriaChange={this.changeCriteria}
      onDeleteCriterion={this.props.onDeleteCriterion}
      onCollapse={this.collapseSection.bind(this, key)}
      onChildrenChange={this.changeChildSections.bind(this, key)}
      onAddCriterion={this.props.onAddCriterion} />
  );

  renderCollapsedSection = (section, key) =>
    <CollapsedSection
      used={this.getCriteriaForWholeSection(section) > 0}
      section={section}
      key={key}
      onExpand={this.expandSection.bind(this, key, section)} />

  render = () => {
    const {
      sections,
      className,
      style
    } = this.props;

    return (
      <div className={className} style={style}>
        {sections.map(this.renderSection).valueSeq()}
      </div>
    );
  }
}
