import { Map } from 'immutable';
import React, { Component, PropTypes } from 'react';
import Portal from 'react-portal';
import { connect } from 'react-redux';
import { updateModel, saveModel, modelsSchemaSelector } from 'ui/redux/modules/models';


class PeoplePicker extends Component {

  static propTypes = {
    person: PropTypes.instanceOf(Map),
    people: PropTypes.instanceOf(Map),
    isOpened: PropTypes.bool,
    scoringScheme: PropTypes.instanceOf(Map),
    onClickClose: PropTypes.func,
    personStatement: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func,
    saveModel: PropTypes.func
  }

  static defaultProps = {
    isOpened: false,
    person: new Map()
  }

  constructor(props) {
    super(props);
    this.state = { selectValue: this.props.person.get('_id') };
  }

  onClickSubmit = () => {
    const { people, person, personStatement, scoringScheme } = this.props;
    const personStatements = person.get('personStatements');
    const personUpate = people.get(this.state.selectValue);

    const personStatementUpdate = personUpate.get('personStatements');

    const updatedStatements = personStatementUpdate.push(
        personStatement.get('_id')
    );

    let targetScore = 0;

    scoringScheme.map((scheme) => {
      targetScore = scheme.get('targetScore');
    }).valueSeq();

    const updatedPersonaStatements = personStatements.delete(
      personStatements.findIndex(item =>
         item === personStatement.get('_id')
      )
    );

    // update the new person with the reconciled statement
    this.props.updateModel({
      schema: 'person',
      id: personUpate.get('_id'),
      path: 'personStatements',
      value: updatedStatements
    });
    this.props.saveModel('person', personUpate.get('_id'));

    // update the old person, take out the statement
    this.props.updateModel({
      schema: 'person',
      id: person.get('_id'),
      path: 'personStatements',
      value: updatedPersonaStatements
    });
    this.props.saveModel('person', person.get('_id'));

    // update the personstatements model with the new people and scores
    this.props.updateModel({
      schema: 'personstatement',
      id: personStatement.get('_id'),
      path: 'score',
      value: targetScore
    });
    this.props.updateModel({
      schema: 'personstatement',
      id: personStatement.get('_id'),
      path: 'person_id',
      value: personUpate.get('_id')
    });
    this.props.saveModel('personstatement', personStatement.get('_id'));

    this.props.onClickClose();
  }

  onSelect = (e) => {
    this.setState({ selectValue: e.target.value });
  }

  onClickClose = () => {
    this.props.onClickClose();
  }

  render = () => {
    const { isOpened, people, person } = this.props;

    return (
      <Portal isOpened={isOpened}>
        <span>
          <div className="modal animated fast fadeIn">
            <div className="modal-dialog">
              <div className="modal-content">

                <div className="modal-header modal-header-bg">
                  <button type="button" className="close" aria-label="Close" onClick={this.onClickClose}><span aria-hidden="true">&times;</span></button>
                  <h4 className="modal-title">Choose Persona</h4>
                </div>
                <div className="modal-body clearfix" style={{ maxHeight: '500px', overflow: 'auto' }}>
                  <div className="row">
                    <div className="col-md-4">
                      <select className="form-control" onChange={this.onSelect.bind(null)} ref={(c) => { this.personSel = c; }} defaultValue={person.get('_id')}>
                        {people.valueSeq().map(assign => (
                          <option key={assign.get('_id')} value={assign.get('_id')}>{assign.get('identifiers').find(identifier => identifier.get('key') === 'xapi_name' || identifier.get('key') === 'xapi_mbox_sha1sum', new Map()).getIn(['values', 0])}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="col-xs-10">
                    <a onClick={this.onClickSubmit} className="btn btn-primary btn-sm"><i className="icon ion-checkmark" /></a>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop" onClick={this.onClickClose} />
          </div>
        </span>
      </Portal>
    );
  }

}

export default connect(state =>
   ({
     people: modelsSchemaSelector('person')(state),
     scoringScheme: modelsSchemaSelector('scoringscheme')(state),
   })
, { updateModel, saveModel })(PeoplePicker);
