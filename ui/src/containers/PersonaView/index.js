/* eslint-disable react/jsx-indent */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withProps, compose } from 'recompose';
import { Map } from 'immutable';
import Tabs from 'ui/components/Material/Tabs';
import { Tab } from 'react-toolbox/lib/tabs';
import uuid from 'uuid';
import { withModel } from 'ui/utils/hocs';
import { addModel } from 'ui/redux/modules/models';
import PersonaMergeForm from 'ui/components/PersonaMergeForm';
import PersonaIdentifiers from 'ui/containers/PersonaIdentifiers';
import PersonaAttributes from 'ui/containers/PersonaAttributes';

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
    attributeValue: '',
    activeTab: 0
  };

  handleTabChange = (activeTab) => {
    this.setState({ activeTab });
  }
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

  renderDetails = () => {
    const { model } = this.props;
    const { activeTab } = this.state;
    const nameId = uuid.v4();

    return (
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

        <Tabs index={activeTab} onChange={this.handleTabChange}>
          <Tab label="Identifiers">
            <PersonaIdentifiers personaId={model.get('_id')} />
          </Tab>
          <Tab label="Attributes">
            <PersonaAttributes personaId={model.get('_id')} />
          </Tab>
        </Tabs>
      </div>
    );
  }

  render = () => {
    const { model } = this.props;
    const showMergeForm = this.props.getMetadata('isMergeFormVisible', false);

    return (
      <div> {
        showMergeForm ? (
          <PersonaMergeForm schema={schema} id={model.get('_id')} />
        ) : (
            this.renderDetails()
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
