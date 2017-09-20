import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateModel, modelsSchemaIdSelector, modelsByFilterSelector, saveModel } from 'ui/redux/modules/models';
import { fetchModels } from 'ui/redux/modules/pagination';
import { Map } from 'immutable';
import { queryStringToQuery } from 'ui/redux/modules/search';
import PeoplePicker from '../PeoplePicker/PeoplePicker';

class PersonaReconcileForm extends Component {
  static propTypes = {
    person: PropTypes.instanceOf(Map),
    statement: PropTypes.instanceOf(Map),
    model: PropTypes.instanceOf(Map),
    scoringScheme: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func,
    fetchModels: PropTypes.func,
    saveModel: PropTypes.func
  }

  static defaultProps = {
    model: new Map()
  }

  constructor(props) {
    super(props);
    this.state = {
      openModal: null
    };
  }

  openModal = () => {
    this.setState({
      openModal: true
    });
  }

  closeModal = () => {
    this.setState({
      openModal: null
    });
  }

  onConfirm = (item, e) => {
    if (e) e.preventDefault();

    const { scoringScheme } = this.props;

    let targetScore = 0;

    scoringScheme.map((scheme) => {
      targetScore = scheme.get('targetScore');
    }).valueSeq();

    this.props.updateModel({
      schema: 'personstatement',
      id: item.get('_id'),
      path: 'score',
      value: targetScore
    });
    this.props.saveModel('personstatement', item.get('_id'));
    this.props.fetchModels('personstatement', queryStringToQuery(targetScore, 'personstatement'));
  }

  renderItems = (statement, model) => {
    const { person } = this.props;
    const { openModal } = this.state;
    const self = this;

    const popupProps = {
      person,
      personStatement: model,
      onClickClose: self.closeModal
    };

    return (
      <tr key={model.get('_id')}>
        <td>
          <div>
            <pre>
              {JSON.stringify(statement.toJS(), null, 2)}
            </pre>
          </div>
        </td>
        <td>{model.get('score')}</td>
        <td><span onClick={this.onConfirm.bind(null, model)} className="btn btn-primary btn-sm"><i className="fa fa-check" /></span></td>
        <td><span onClick={this.openModal.bind(null)} className="btn btn-primary btn-sm"><i className="fa fa-exchange" /></span></td>
        <td style={{ display: 'none' }}><PeoplePicker isOpened={openModal === true} {...popupProps} /></td>
      </tr>
    );
  }

  renderIdents = items =>
     items.map(key =>
       (
         <tr key={key.get('key')}>
           <td>{key.get('key').slice(5)}</td>
           <td>
             {key.get('values').map(value =>
               <div key={value}>{value}</div>
          ).valueSeq()}
           </td>
         </tr>
      )
    ).valueSeq()


  render = () => {
    const { statement, model, person } = this.props;
    const items = this.renderItems(statement, model);
    const identifiers = this.renderIdents(person.get('identifiers'));

    return (
      <div>
        <div><b>Persona Identifiers</b></div>
        <table className="table table-bordered">
          <tbody id="personIdentifers">
            {identifiers}
          </tbody>
        </table>
        <table className="table table-bordered">
          <tbody id="personstatements">
            <tr>
              <td><b>Statement Information</b></td>
              <td><b>Score</b></td>
              <td><b>Confirm</b></td>
              <td><b>Reassign</b></td>
            </tr>
            {items}
          </tbody>
        </table>
      </div>
    );
  }
}

export default connect((state, ownProps) =>
   ({
     person: modelsSchemaIdSelector('person', ownProps.model.get('person_id'))(state),
     scoringScheme: modelsByFilterSelector('scoringscheme')(state),
     statement: modelsSchemaIdSelector('statement', ownProps.model.get('statement_id'))(state),
   })
, { updateModel, saveModel, fetchModels })(PersonaReconcileForm);
