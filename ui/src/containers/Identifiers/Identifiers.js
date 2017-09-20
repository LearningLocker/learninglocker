import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';
import _ from 'lodash';
import { Map, List } from 'immutable';

@connect(
  () => ({}),
  { updateModel }
)
export default class Identifiers extends Component {

  static propTypes = {
    identIds: PropTypes.instanceOf(List),
    model: PropTypes.object,
    item: PropTypes.object,
    updateModel: PropTypes.func
  }

  static defaultProps = {
    model: new Map()
  }

  constructor(props) {
    super(props);
    this.scoringScheme = {
      xapi_name: 3,
      xapi_mbox: 5,
      xapi_openid: 5,
      xapi_home_page: 1.5,
      xapi_id: 3.5,
      xapi_mbox_sha1sum: 4
    };
  }

  onChangeKey = (id, e) => {
    if (e) e.preventDefault();

    const { model, identIds } = this.props;

    const list = identIds.update(
      identIds.findIndex(item =>
         item.get('_id') === id
      ), item =>
       item.set('key', e.target.value)
    );

    this.props.updateModel(['person', model.get('_id'), 'identifiers'], list);
  }

  onChangeValue = (id, e) => {
    if (e) e.preventDefault();

    const { model, identIds } = this.props;
    const list = identIds.update(
      identIds.findIndex(item =>
         item.get('_id') === id
      ), (item) => {
      const myList = new List(item.get('values').map((val) => {
        if (val === e.target.id) return e.target.value;
        return val;
      }));
      return item.set('values', myList);
    });

    this.props.updateModel(['person', model.get('_id'), 'identifiers'], list);
  }

  onDelete = (id, e) => {
    if (e) e.preventDefault();

    const { model, identIds } = this.props;

    const list = identIds.delete(
      identIds.findIndex(item =>
         item.get('_id') === id
      ));

    this.props.updateModel(['person', model.get('_id'), 'identifiers'], list);
  }

  render = () => {
    const { item } = this.props;
    const itemKey = item.get('key');
    const itemId = item.get('_id');
    const itemVal = item.get('values');

    return (
      <tr>
        <td>
          <select
            id={itemKey}
            className="form-control"
            value={itemKey}
            onChange={this.onChangeKey.bind(null, itemId)}>
            {_.map(this.scoringScheme, (key, value) => {
              const newVal = value.slice(5);
              return <option value={value} key={value} >{newVal}</option>;
            })}
          </select>
        </td>
        <td>
          {itemVal.map((value, index) =>
            <input id={value} key={index} type="text" onChange={this.onChangeValue.bind(null, itemId)} className="form-control" value={value} />
        ).valueSeq()}
        </td>
        <td><span onClick={this.onDelete.bind(null, itemId)} className="btn btn-danger"><i className="fa fa-trash-o" /></span></td>
      </tr>
    );
  }

}
