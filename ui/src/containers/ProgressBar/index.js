/* eslint-disable react/jsx-indent */
import React from 'react';
import { Map } from 'immutable';
import ProgressBar from 'ui/components/Material/ProgressBar';
import { PROGRESS_MODELS } from '../../utils/constants';

export default ({ model, schema }) => {
  const progressModel = PROGRESS_MODELS[schema];

  if (!progressModel) return <noscript />;

  const statusObject = progressModel.statusObject;
  const inProgress = progressModel.inProgress;
  const workerStatus = model.get(statusObject, new Map({}));
  const totalCount = workerStatus.get(progressModel.totalCount, 0);
  const remainingCount = workerStatus.get(progressModel.remainingCount, 0);

  if (!workerStatus.get(inProgress)) return <noscript />;

  return totalCount === 0 ? (
    <ProgressBar type="linear" />
  ) : (
    <ProgressBar
      type="linear"
      mode="determinate"
      value={totalCount - remainingCount}
      max={totalCount} />
  );
};
