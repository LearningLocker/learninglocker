import React from 'react';
import ModelList from 'ui/containers/ModelList';
import { withModels } from 'ui/utils/hocs';
import { fromJS } from 'immutable';
import { compose, withProps } from 'recompose';

const PersonaList = compose(
  withProps({
    schema, 
    sort: fromJS({createdAt: -1, _id: -1})
  }),
  withModels
)(ModelList);

const PersonaComponent = () => (
  <div>
    <header id="topbar">
      Persona - Manage
    </header>
    <div className="row">
      <div className="col-md-12">
        hello world
      </div>
    </div>
  </div>
  );

export default PersonaComponent;
