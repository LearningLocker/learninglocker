/* eslint-disable react/jsx-indent */
import React from 'react';
import { Map } from 'immutable';
import { isFunction } from 'lodash';
import ProgressBar from 'ui/components/Material/ProgressBar';
import { PROGRESS_MODELS } from 'ui/utils/constants';

const getTotalCount = ({
  progressModel,
  workerStatus,
  model
}) => {
  if (progressModel.getTotalCount) {
    return progressModel.getTotalCount(model);
  }
  return workerStatus.get && workerStatus.get(progressModel.totalCount, 0) || 0;
};

const getProcessedCount = ({
  progressModel,
  workerStatus,
  model,
  totalCount
}) => {
  if (progressModel.getProcessedCount) {
    return progressModel.getProcessedCount(model);
  }

  const remainingCount = workerStatus.get && workerStatus.get(progressModel.remainingCount, 0) || 0;
  return totalCount - remainingCount;
};

export default ({ model, schema }) => {
  const progressModel = PROGRESS_MODELS[schema];

  if (!progressModel) return <noscript />;

  const statusObject = progressModel.statusObject;
  const inProgress = progressModel.inProgress;
  const workerStatus = model.get(statusObject, new Map({}));
  const totalCount = getTotalCount({ model, workerStatus, progressModel });

  if (isFunction(inProgress)) {
    if (!inProgress(workerStatus)) return <noscript />;
  } else if (!workerStatus.get(inProgress)) {
    return <noscript />;
  }

  if (!totalCount) return <ProgressBar type="linear" />;

  const processedCount = getProcessedCount({
    model,
    workerStatus,
    progressModel,
    totalCount
  });

  return (
    <ProgressBar
      type="linear"
      mode="determinate"
      value={processedCount}
      max={totalCount} />
  );
};
