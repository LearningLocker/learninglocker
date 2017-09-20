import React, { Component, PropTypes } from 'react';
import { Map, List } from 'immutable';
import isEmpty from 'lodash/isEmpty';
import Switch from 'ui/components/Material/Switch';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import QueryBuilder from 'ui/containers/QueryBuilder';
import styles from './waypointform.css';

class WaypointForm extends Component {
  static propTypes = {
    waypoint: PropTypes.instanceOf(Map),
    update: PropTypes.func
  };

  static defaultProps = {
    waypoint: new Map()
  };

  state = {
    isActiveDisabled: false
  };

  componentDidMount = () => {
    this.checkQuery(this.props.waypoint.get('conditions', new Map()));
  }

  /**
   * convert the query to an object and check that it has matching conditions
   * we can only go so far,
   * but this should catch occasions where there is simply nothing in the query)
   * @param  {[type]} query [description]
   * @return {[type]}       [description]
   */
  checkQuery = (query) => {
    const jsQuery = query.toJS();
    if (!jsQuery || isEmpty(jsQuery)) {
      this.setState({ isActiveDisabled: true });
      if (this.props.waypoint.get('isActive', false)) {
        this.props.update('isActive', false);
      }
    } else {
      this.setState({ isActiveDisabled: false });
    }
  }

  onChangeQuery = (nextQuery) => {
    this.props.update('conditions', nextQuery);
    this.checkQuery(nextQuery);
  }

  onChangeAttr = (attr, e) => {
    this.props.update(attr, e.target.value);
  }

  onActiveToggle = (checked) => {
    this.props.update('isActive', checked);
  }

  render = () => {
    const { waypoint } = this.props;
    const query = waypoint.get('conditions', new Map());
    const isActive = waypoint.get('isActive', false);

    const { isActiveDisabled } = this.state;
    return (
      <div className={`row-fluid ${styles.waypointForm}`}>
        <div className="col-md-4">
          <div>
            <div className="form-group">
              <Switch
                label="Active?"
                onChange={this.onActiveToggle}
                disabled={isActiveDisabled}
                checked={isActive} />
            </div>
            { isActiveDisabled &&
              <p className="bg-danger">A waypoint must have non empty conditions before it is activated</p>
            }

            <div className="form-group">
              <label htmlFor={`${waypoint.get('_id')}descriptionInput`}>Description</label>
              <input
                id={`${waypoint.get('_id')}descriptionInput`}
                className="form-control"
                placeholder="A short description"
                value={waypoint.get('description')}
                onChange={this.onChangeAttr.bind(null, 'description')} />
            </div>

            <div className="form-group">
              <label htmlFor={`${waypoint.get('_id')}countInput`}>Count</label>
              <input
                id={`${waypoint.get('_id')}countInput`}
                className="form-control"
                type="number"
                placeholder="How many times does this waypoint need to be completed"
                value={waypoint.get('count')}
                onChange={this.onChangeAttr.bind(null, 'count')} />
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="form-group">
            <label htmlFor={`${waypoint.get('_id')}conditionsInput`}>Conditions</label>
            <QueryBuilder
              id={`${waypoint.get('_id')}conditionsInput`}
              componentPath={new List(['waypoint', this.props.waypoint.get('_id')])}
              query={query}
              onChange={this.onChangeQuery} />
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(WaypointForm);
