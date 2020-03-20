import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import decodeDot from 'lib/helpers/decodeDot';
import { CollapsedSectionWrapper } from 'ui/containers/BasicQueryBuilder/styled';

class CollapsedSection extends Component {
  static propTypes = {
    used: PropTypes.bool,
    section: PropTypes.instanceOf(Map),
    onExpand: PropTypes.func,
  }

  shouldComponentUpdate = nextProps => !(
    this.props.section.equals(nextProps.section) &&
    this.props.used === nextProps.used
  );

  expandSection = (event) => {
    event.preventDefault();
    this.props.onExpand();
  }

  render = () => {
    const { section } = this.props;
    const title = decodeDot(section.get('title', ''));
    const containsCriteria = this.props.used;

    return (
      <CollapsedSectionWrapper
        isUsed={containsCriteria}
        onClick={this.expandSection} >
        <i className="ion-plus-circled" /> {title}
      </CollapsedSectionWrapper>
    );
  }
}

export default CollapsedSection;
