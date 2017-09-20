import { fromJS } from 'immutable';
import {
  modelsSelector,
  localUnsavedSchemaIdSelector,
  localPendingSchemaIdSelector,
  localModelSchemaIdSelector,
  remoteModelSchemaIdSelector,
  modelsSchemaIdSelector,
  // modelsByFilterSelector
} from 'ui/redux/modules/models/selectors.js';

const unsavedModel = {
  testString: 'unsaved',
  testArray: [{ shared: 1 }, { unsaved: 2 }],
  testObject: { unsaved: 1 },
  unsavedOnly: true
};

const pendingModel = {
  testString: 'pending',
  testObject: { pending: 1 },
  pendingOnly: true
};

const remoteModel = {
  testString: 'pending',
  testArray: [{ shared: 2 }, { remote: 2 }],
  testObject: { remote: 1 },
  remoteOnly: true
};

const unsavedModel2 = {
  testString: 'unsaved',
  testArray: [{ shared: 1 }, { unsaved: 2 }],
  testObject: { unsaved: 1 },
  unsavedOnly: true
};

const remoteModel2 = {
  remoteOnly: true
};

const remoteModel3 = {
  remoteOnly: true
};

const modelState = {
  test: {
    testid: {
      localCache: {
        unsaved: unsavedModel,
        pending: pendingModel
      },
      remoteCache: remoteModel
    },
    testid2: {
      localCache: {
        unsaved: unsavedModel2,
      },
      remoteCache: remoteModel2
    },
    testid3: {
      remoteCache: remoteModel3
    }
  }
};

const state = {
  models: fromJS(modelState),
};

test('modelsSelector returns the models key from the state', () => {
  const selectedState = modelsSelector(state);
  expect(modelState).toEqual(selectedState.toJS());
});

test('localUnsavedSchemaIdSelector returns local unsaved state for a model', () => {
  const selectedModel = localUnsavedSchemaIdSelector('test', 'testid')(state);
  expect(unsavedModel).toEqual(selectedModel.toJS());
});

test('localPendingSchemaIdSelector returns local pending state for a model', () => {
  const selectedModel = localPendingSchemaIdSelector('test', 'testid')(state);
  expect(pendingModel).toEqual(selectedModel.toJS());
});

test('localModelSchemaIdSelector returns correctly merged local and pending state', () => {
  const selectedModel = localModelSchemaIdSelector('test', 'testid')(state);
  const mergedModel = {
    pendingOnly: true,
    unsavedOnly: true,
    testString: 'unsaved',
    testObject: { unsaved: 1 },
    testArray: [{ shared: 1 }, { unsaved: 2 }]
  };
  expect(mergedModel).toEqual(selectedModel.toJS());
});

test('remoteModelSchemaIdSelector returns remote state for a model', () => {
  const selectedModel = remoteModelSchemaIdSelector('test', 'testid')(state);
  expect(remoteModel).toEqual(selectedModel.toJS());
});

test('modelsSchemaIdSelector correctly merges local and remote state', () => {
  const selectedModel = modelsSchemaIdSelector('test', 'testid')(state);
  const mergedModel = {
    testString: 'unsaved',
    testArray: [{ shared: 1 }, { unsaved: 2 }],
    testObject: { unsaved: 1 },
    unsavedOnly: true,
    pendingOnly: true,
    remoteOnly: true
  };
  expect(mergedModel).toEqual(selectedModel.toJS());
});

// @TODO modelsByFilterSelector
