import React, { Component, PropTypes } from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { getAvailableSections } from 'ui/redux/modules/queryBuilder';
import {
  queriesSectionsSelector,
  queryChangeSections
} from 'ui/redux/modules/queries';
import { fetchModels } from 'ui/redux/modules/pagination';
import Sections from './Sections';
import styles from './styles.css';

/**
 * This component was made to prevent the BasicQueryBuilder
 * recalculating criteria every time sections were expanded and collapsed.
 */
class QueryBuilderSections extends Component {
  static propTypes = {
    componentPath: PropTypes.instanceOf(List),
    sections: PropTypes.instanceOf(Map),
    criteria: PropTypes.instanceOf(Map),
    onCriteriaChange: PropTypes.func,
    onAddCriterion: PropTypes.func,
    onDeleteCriterion: PropTypes.func,
    queryChangeSections: PropTypes.func,
  }

  shouldComponentUpdate = nextProps => !(
    this.props.sections.equals(nextProps.sections) &&
    this.props.criteria.equals(nextProps.criteria)
  );

  changeSections = (changedSections) => {
    this.props.queryChangeSections(this.props.componentPath, changedSections);
  }

  getSections = () => this.props.sections;

  render = () => (
    <Sections
      className={styles.topLevel}
      sections={this.getSections()}
      criteria={this.props.criteria}
      onCriteriaChange={this.props.onCriteriaChange}
      onSectionsChange={this.changeSections}
      onAddCriterion={this.props.onAddCriterion}
      onDeleteCriterion={this.props.onDeleteCriterion} />
  );
}

export default compose(
  withStyles(styles),
  connect((state, ownProps) => {
    const componentPath = ownProps.componentPath;
    const sectionsInState = queriesSectionsSelector(componentPath)(state);
    const availableSections = getAvailableSections(sectionsInState)(state);
    const sections = availableSections.mergeDeep(sectionsInState);
    return { sections };
  }, { fetchModels, queryChangeSections }),
)(QueryBuilderSections);
