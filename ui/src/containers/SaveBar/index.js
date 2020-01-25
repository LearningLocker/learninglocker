import React from 'react';
import { fromJS, List } from 'immutable';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { COMPLETED, FAILED, IN_PROGRESS } from 'ui/utils/constants';
import { compose } from 'recompose';
import SaveBarErrors from 'ui/containers/SaveBarErrors';
import {
  Container,
  Label,
  StyledProgressBar,
} from 'ui/containers/SaveBar/styled';

export const savingSelector = () => createSelector(
  state => // models
    state.models
      .map(
        model =>
          model.filter(item =>
            item && item.getIn &&
            (
              !!item.getIn(['remoteCache', 'requestState']) ||
              !!item.getIn(['deleteState'])
            )
          )
      )
      .toList()
      .flatMap(
        model => model
          .toList()
          .flatMap(
            item =>
              // item && item.getIn && item.getIn(['remoteCache', 'requestState'])
              new List([
                item && item.getIn && item.getIn(['remoteCache', 'requestState']),
                item && item.getIn && item.getIn(['deleteState'])
              ])
          )
      )
  ,
  state => // uploadPersonas
    state
      .uploadPersonas
      .filter(model => model && model.getIn && !!model.getIn(['requestState']))
      .toList()
      .map(model => model.getIn(['requestState'])),
  state => // uploadPeople
    state
      .mergePersona
      .filter(model => model && model.getIn && !!model.getIn(['requestState']))
      .toList()
      .map(model => model.getIn(['requestState'])),
  state => // update UserOrganisationSettings
    fromJS(state.userOrganisationSettings || {})
      .flatMap((v1, k1) => v1.mapKeys(k2 => `${k1}-${k2}`))
      .filter(model => model && model.getIn && !!model.getIn(['requestState']))
      .toList()
      .map(model => model.getIn(['requestState'])),
  (
    saving,
    uploadPersonasSaving,
    mergePersonaSaving,
    userOrganisationSettingsSaving
  ) => {
    saving = saving
      .concat(uploadPersonasSaving)
      .concat(mergePersonaSaving)
      .concat(userOrganisationSettingsSaving);

    if (saving.includes(IN_PROGRESS)) {
      return IN_PROGRESS;
    }

    if (saving.includes(FAILED)) {
      return FAILED;
    }

    if (saving.includes(COMPLETED)) {
      return COMPLETED;
    }

    return false;
  }
);

const getLabel = (value) => {
  switch (value) {
    case IN_PROGRESS:
      return 'SAVING';
    case COMPLETED:
      return 'SAVED';
    case FAILED:
      return 'SAVE FAILED';
    default:
      return '';
  }
};

const SaveBar = ({
  saving
}) => {
  if (!saving) {
    return null;
  }

  const savingStageClassName = saving.toLowerCase();

  return (
    <Container className={'save-bar'}>
      <StyledProgressBar
        savingStageClassName={savingStageClassName}
        mode={saving === IN_PROGRESS ? 'indeterminate' : 'determinate'}
        value={100} />
      <Label savingStageClassName={savingStageClassName}>
        {getLabel(saving)}
      </Label>
      <SaveBarErrors />
    </Container>);
};

const SaveBarComposed = compose(
  connect(
    state => ({
      saving: savingSelector()(state)
    })
  )
)(SaveBar);

export default SaveBarComposed;
