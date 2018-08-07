import React from 'react';
import { COMPONENT, TEXT } from 'ui/utils/constants';
import uuid from 'uuid';
import VisualisationTypeIcon from '../containers/Visualise/VisualisationTypeIcon';

const axv = 'axesvalue';
const axV = 'axesxValue';
const ayV = 'axesyValue';
const axg = 'axesgroup';

export const shorten = (target) => {
  if (target.length >= 20) {
    switch (true) {
      case target.indexOf(' ') !== -1: return target.split(' ')[0];
      case target.indexOf('.') !== -1: return target.split('.')[0];
      case target.indexOf('%20') !== -1: return target.split('%20')[target.split('%20').length];
      default: return target.substring(0, 24);
    }
  } else {
    return target;
  }
};

export const getLegend = (key, model, type = null) => {
  const select = (ky, axis) => model.getIn([ky, 'searchString'], axis);
  const x = shorten(model.get('axesxLabel', select(axv, 'X-Axis')));
  const y = shorten(model.get('axesyLabel', select(axg, 'Y-Axis')));

  const getResultForXY = () => {
    const labelString = key === 'x' ? model.axesxLabel : model.axesyLabel;
    const defaultLabel = key === 'x' ? model.getIn(['axesxValue', 'searchString'], 'X-Axis') : model.getIn(['axesgroup', 'searchString'], 'Y-Axis');
    if (labelString && labelString.length) {
      return labelString;
    }
    return defaultLabel;
  };

  if (type !== 'XVSY') {
    switch (key) {
      case 'x': return x.length > 1 ? x : shorten(select(axv, 'X-Axis'));
      case 'y': return y.length > 1 ? y : shorten(select(axg, 'Y-Axis'));
      default: return null;
    }
  }
  switch (key) {
    case 'x': return getResultForXY(key);
    case 'y': return getResultForXY(key)
    default: return null;
  }
};

const defaultSelector = (model, type, prefix, format = TEXT) => {
  const formattedDefault = () => {
    const select = key => model.getIn([key, 'searchString'], '');
    const addXY = (selectedX, selectedY = 'Time') => `X: ${selectedX} Y: ${selectedY}`;
    const addYX = (selectedX, selectedY = 'Time') => `X: ${selectedY} Y: ${selectedX}`;
    switch (type) {
      case ('FREQUENCY'): return addYX(select(axv) || select(ayV), 'Time');
      case ('LEADERBOARD'): return addYX(select(axg), select(axv) || select(ayV));
      case ('XVSY'): return addXY(select(axV), select(axv) || select(ayV));
      case ('COUNTER'): return select(axv) || select(ayV);
      case ('PIE'): return `${select(axv) || select(ayV)} / ${select(axg)}`;
      case ('Unnamed'): return 'Pick a visualisation';
      default: return addXY(select(axg), select(axv) || select(ayV));
    }
  };

  const formatDefaultComponent = (pre, formatted) => ([<span key={uuid.v4()}>
    {pre}
  </span>,
    <span key={uuid.v4()} style={{ color: '#B9B9B9', fontWeight: '100' }}>
      {` ${formatted}`}
    </span>]
  );

  return format === COMPONENT ? formatDefaultComponent(prefix, formattedDefault(type)) : `${prefix} ${formattedDefault(type)}`;
};

export const createVisualisationName = (model, prefix) => defaultSelector(model, model.get('type', 'Unnamed'), prefix, COMPONENT);
export const createVisualisationText = (model, prefix = '') => defaultSelector(model, model.get('type', 'Unnamed'), prefix, TEXT);
export const createDefaultTitleWithIcon = (model, name) => <span><VisualisationTypeIcon id={model.get('_id')} sourceView={model.get('sourceView')} /><span style={{ marginLeft: '3px' }}>{name || createVisualisationName(model)}</span></span>;
export const createDefaultTitle = (model, prefix) => createVisualisationText(model, prefix);
export const getPercentage = (res1, res2) => {
  const newValue = res1 || 0;
  const oldValue = res2 || 0;
  const percentage = parseInt(Math.round(((newValue - oldValue) / newValue) * 100));
  let formattedResult;
  switch (true) {
    case res2 === 0 || isNaN(percentage): formattedResult = { result: 'N/A', color: '#9BA5AB' }; break;
    case percentage < 0 : formattedResult = { result: `${percentage}%`, color: '#E73304' }; break;
    default: formattedResult = { result: `+${percentage}%`, color: '#23A17E' }; break;
  }
  return formattedResult;
};
