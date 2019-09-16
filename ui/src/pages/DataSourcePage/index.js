import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tooltipFactory from 'react-toolbox/lib/tooltip';
import { IconButton } from 'react-toolbox/lib/button';
import { withProps, compose } from 'recompose';
import { Map, fromJS, List } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { VelocityTransitionGroup } from 'velocity-react';
import { update$dteTimezone } from 'lib/helpers/update$dteTimezone';
import {
  statementQuerySelector,
  statementTimezoneSelector,
} from 'ui/redux/selectors';
import { updateStatementQuery } from 'ui/redux/actions';
import activeOrgSelector from 'ui/redux/modules/activeOrgSelector';
import QueryBuilder from 'ui/containers/QueryBuilder';
import ModelList from 'ui/containers/ModelList';
import { addTokenToQuery } from 'ui/utils/queries';
import { valueToCriteria } from 'ui/redux/modules/queryBuilder';
import { withModels } from 'ui/utils/hocs';
import Statement from './Statement';
import StatementForm from './StatementForm';
import ExportManager from './ExportManager';

import styles from './styles.css';

const withStatements = compose(
  withProps({ schema: 'statement', displayOwner: false }),
  withModels
);

const StatementList = withStatements(ModelList);

const TooltipIconButton = tooltipFactory(IconButton);
const querySort = new Map({ timestamp: -1, _id: 1 });

class Source extends PureComponent {
  static propTypes = {
    updateStatementQuery: PropTypes.func,
    query: PropTypes.instanceOf(Map),
    timezone: PropTypes.string,
    organisationModel: PropTypes.instanceOf(Map),
  };

  static defaultProps = {
    query: new Map(),
    timezone: null,
    organisationModel: new Map(),
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      isExporting: false
    };
  }

  componentDidMount = () => this.updateQueryTimezone();

  componentDidUpdate = () => this.updateQueryTimezone();

  updateQueryTimezone = () => {
    const { query, organisationModel } = this.props;
    const timezone = this.props.timezone || organisationModel.get('timezone', 'UTC');
    const timezoneUpdated = update$dteTimezone(query, timezone);

    if (!timezoneUpdated.equals(query)) {
      this.props.updateStatementQuery(timezoneUpdated);
    }
  }

  toggleIsExporting = () => {
    this.setState({ isExporting: !this.state.isExporting });
  }

  onChangeQuery = (nextQuery) => {
    this.props.updateStatementQuery(nextQuery);
  }

  setFilterAt = (keyPath, value) => {
    const tokenQuery = valueToCriteria(keyPath.join('.'), value);
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
          {this.state.isExporting &&
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
                  timezone={this.props.timezone}
                  orgTimezone={this.props.organisationModel.get('timezone', 'UTC')}
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
    timezone: statementTimezoneSelector(state),
    organisationModel: activeOrgSelector(state),
  }), { updateStatementQuery })
)(Source);
