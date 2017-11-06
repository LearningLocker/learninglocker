/* eslint-disable react/jsx-indent */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withProps, compose } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import { addModel } from 'ui/redux/modules/models';
import PersonaIdentifierForm from 'ui/components/PersonaIdentifierForm';
import PersonaAttributeForm from 'ui/components/PersonaAttributeForm';
import PersonaMergeForm from 'ui/components/PersonaMergeForm';
import PersonaIdentifiers from 'ui/containers/PersonaIdentifiers';
import PersonaAttributes from 'ui/containers/PersonaAttributes';
import { Map } from 'immutable';
import classNames from 'classnames';
import uuid from 'uuid';

const schema = 'persona';

class PersonaView extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func,
    addModel: PropTypes.func
  };

  static defaultProps = {
    model: new Map()
  };

  state = {
    showIdentifiers: false,
    showAttributes: false,
    showAddForm: false,
    showSetAttributeForm: false,
    identifierType: 'mbox',
    identifierValue: '',
    attributeKey: '',
    attributeValue: ''
  };

  handleToggle = () => {
    this.setState({ showIdentifiers: !this.state.showIdentifiers });
  };

  handleAttributesToggle = () => {
    this.setState({ showAttributes: !this.state.showAttributes });
  };

  handleShowAddForm = (e) => {
    e.preventDefault();
    this.setState({ showAddForm: true });
  };

  handleShowSetAttributeForm = (e) => {
    e.preventDefault();
    this.setState({ showSetAttributeForm: !this.state.showSetAttributeForm });
  }

  handleAdd = (e) => {
    e.preventDefault();
    const { model } = this.props;
    const { identifierType, identifierValue } = this.state;
    const props = {
      organisation: model.get('organisation'),
      ifi: {
        key: identifierType,
        value: identifierValue
      },
      persona: {
        $oid: model.get('_id')
      }
    };
    this.props.addModel({ schema: 'personaIdentifier', props });
    this.setState({ showAddForm: false });
  };

  handleSetAttribute = (e) => {
    e.preventDefault();
    const { model } = this.props;
    const { attributeKey, attributeValue } = this.state;
    const props = {
      organisation: model.get('organisation'),
      key: attributeKey,
      value: attributeValue,
      personaId: {
        $oid: model.get('_id')
      }
    };
    this.props.addModel({ schema: 'personaAttribute', props });
    this.setState({ showSetAttributeForm: false });
  }

  handleIdentifierTypeChange = (identifierType) => {
    this.setState({ identifierType });
  };

  handleIdentifierValueChange = (identifierValue) => {
    this.setState({ identifierValue });
  };

  handleAttributeKeyChange = (attributeKey) => {
    this.setState({ attributeKey });
  };

  handleAttributeValueChange = (attributeValue) => {
    this.setState({ attributeValue });
  };

  setAttr = (attr, value) => {
    this.props.updateModel({ path: [attr], value });
  };

  onChangeAttr = (attr, e) => {
    this.setAttr(attr, e.target.value);
  };

  renderButtons = () => {
    const {
      showAddForm,
      showIdentifiers,
      showAttributes,
      showSetAttributeForm
    } = this.state;
    const identityIconClasses = classNames({
      icon: true,
      'ion-chevron-right': !showIdentifiers,
      'ion-chevron-down': showIdentifiers
    });

    const attributesIconClasses = classNames({
      icon: true,
      'ion-chevron-right': !showAttributes,
      'ion-chevron-down': showAttributes
    });

    return (
      <div>
        <button
          id="toggle"
          className="btn btn-inverse btn-sm"
          onClick={this.handleToggle}>
          <i className={identityIconClasses} /> View identity information
        </button>

        {' '}

        {showAddForm
          ? <a className="btn btn-inverse btn-sm" onClick={this.handleAdd}>
              <i className="fa fa-floppy-o" /> Save identifier
            </a>
          : <a
            className="btn btn-inverse btn-sm"
            onClick={this.handleShowAddForm}>
              <i className="ion ion-plus" /> Add identifier
            </a>
        }

        {' '}

        <button
          id="toggleAttributes"
          className="btn btn-inverse btn-sm"
          onClick={this.handleAttributesToggle} >
          <i className={attributesIconClasses} /> View attributes
        </button>

        {' '}

        { showSetAttributeForm ?
          <a className="btn btn-inverse btn-sm" onClick={this.handleSetAttribute}>
            <i className="fa fa-floppy-o" /> Save attribute
          </a>
          :
          <a
            className="btn btn-inverse btn-sm"
            onClick={this.handleShowSetAttributeForm}>
              <i className="ion ion-plus" /> Set attribute
          </a>
        }
      </div>
    );
  };

  render = () => {
    const { model } = this.props;
    const {
      showIdentifiers,
      showAttributes,
      showAddForm,
      identifierType,
      identifierValue,
      showSetAttributeForm,
      attributeKey,
      attributeValue,
    } = this.state;
    const showMergeForm = this.props.getMetadata('isMergeFormVisible', false);
    const nameId = uuid.v4();

    return (
      <div> {
        showMergeForm ? (
          <PersonaMergeForm schema={schema} id={model.get('_id')} />
        ) : (
        <div>
          <div className="form-group">
            <label htmlFor={nameId} className="control-label">
              Name
            </label>
            <input
              id={nameId}
              className="form-control"
              placeholder="Name"
              value={model.get('name') || ''}
              onChange={this.onChangeAttr.bind(null, 'name')} />
          </div>

          {this.renderButtons()}

          {showAddForm &&
            <PersonaIdentifierForm
              identifierType={identifierType}
              identifierValue={identifierValue}
              handleIdentifierTypeChange={this.handleIdentifierTypeChange}
              handleIdentifierValueChange={this.handleIdentifierValueChange} />}

          {showIdentifiers &&
            <div>
              <br />
              <h4>Persona Identifiers</h4>
              <hr />
              <PersonaIdentifiers personaId={model.get('_id')} />
            </div>}

          {showSetAttributeForm &&
            <PersonaAttributeForm
              attributeKey={attributeKey}
              attributeValue={attributeValue}
              handleAttributeKeyChange={this.handleAttributeKeyChange}
              handleAttributeValueChange={this.handleAttributeValueChange}
            />
          }

          {showAttributes &&
            <div>
              <br />
              <h4>Persona Attributes</h4>
              <hr />
              <PersonaAttributes personaId={model.get('_id')} />
            </div>
          }
        </div>
      )}
      </div>
    );
  };
}

export default compose(
  withProps(({ model }) => ({ schema, id: model.get('_id') })),
  withModel,
  connect(() => ({}), { addModel })
)(PersonaView);
