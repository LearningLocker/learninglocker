import { fromJS } from 'immutable';

export default (stage, stageContent) => {
  const keys = Object.keys(stageContent).length;
  if (keys === 0) return fromJS([]);
  return fromJS([{ [stage]: stageContent }]);
};
