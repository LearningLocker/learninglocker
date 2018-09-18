import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Map, fromJS, List } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { VelocityTransitionGroup } from 'velocity-react';
import { statementQuerySelector } from 'ui/redux/selectors';
import { updateStatementQuery } from 'ui/redux/actions';
import Statement from 'ui/components/Statement';
import QueryBuilder from 'ui/containers/QueryBuilder';
import StatementForm from 'ui/containers/StatementForm';
import ModelList from 'ui/containers/ModelList';
import ExportManager from 'ui/containers/ExportManager';
import { addTokenToQuery } from 'ui/utils/queries';
import { valueToCriteria } from 'ui/redux/modules/queryBuilder';
import { withModels } from 'ui/utils/hocs';
import tooltipFactory from 'react-toolbox/lib/tooltip';
import { IconButton } from 'react-toolbox/lib/button';
import { withProps, compose } from 'recompose';
import styles from './styles.css';

const withStatements = compose(
  withProps({ schema: 'statement', displayOwner: false }),
  withModels
);

const StatementList = withStatements(ModelList);

const TooltipIconButton = tooltipFactory(IconButton);
const querySort = new Map({ timestamp: -1, _id: 1 });

class Source extends Component {
  static propTypes = {
    updateStatementQuery: PropTypes.func,
    query: PropTypes.instanceOf(Map),
  };

  static defaultProps = {
    query: new Map(),
    statements: new Map()
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      isExporting: false
    };
  }

  toggleIsExporting = () => {
    this.setState({ isExporting: !this.state.isExporting });
  }

  onChangeQuery = (nextQuery) => {
    this.props.updateStatementQuery(nextQuery);
  }

  setFilterAt = (keyPath, value) => {
    const tokenQuery = valueToCriteria(keyPath.join('.'), new Map({ value }));
    this.onChangeQuery(addTokenToQuery(this.props.query, keyPath, tokenQuery));
  }

  displayStatement = (statement = new Map()) => (
    <Statement
      statement={statement}
      setFilterAt={this.setFilterAt} />
  );

  render = () => {
    const pipelines = fromJS([
      [{ $match: this.props.query }]
    ]);
    return (
      <div>
        <header id="topbar">
          <div className={styles.heading}>
            Statements
            <div className={styles.buttons}>
              <TooltipIconButton
                tooltip="Open export panel"
                tooltipPosition="left"
                onClick={this.toggleIsExporting} >
                <i className="ion-android-download" />
              </TooltipIconButton>
            </div>
          </div>
        </header>
        <VelocityTransitionGroup
          component="div"
          leave={{ animation: 'slideUp', duration: 350 }}>
          { this.state.isExporting &&
            <div className="row">
              <div className="col-md-12">
                <div className="panel panel-default">
                  <ExportManager pipelines={pipelines} />
                </div>
              </div>
            </div>
          }
        </VelocityTransitionGroup>
        <div className="row">
          <div className="col-md-6 col-lg-5">
            <div className="panel panel-default">
              <div className="panel-heading">
                <div className="panel-title">
                  Explore
                </div>
              </div>
              <div className="panel-body" style={{ paddingTop: '0px' }}>
                <QueryBuilder
                  componentPath={new List(['source'])}
                  query={this.props.query}
                  onChange={this.onChangeQuery} />
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-7">
            <StatementList
              filter={this.props.query}
              sort={querySort}
              getDescription={this.displayStatement}
              ModelForm={StatementForm}
              buttons={[]} />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(state => ({
    query: statementQuerySelector(state),
  }), { updateStatementQuery })
)(Source);
