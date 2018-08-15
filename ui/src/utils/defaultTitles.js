import React from 'react';
import { COMPONENT, TEXT } from 'ui/utils/constants';
import uuid from 'uuid';
import { startCase, toLower } from 'lodash';
import VisualisationTypeIcon from '../containers/Visualise/VisualisationTypeIcon';

const axv = 'axesvalue';
const axV = 'axesxValue';
const ayV = 'axesyValue';
const axg = 'axesgroup';

export const shorten = (target, forXAxis) => {
  if (target.length >= 20 && forXAxis) {
    if (target.indexOf(' ') !== -1) {
      return target.split(' ')[0];
    }
    if (target.indexOf('.') !== -1) {
      return target.split('.')[0];
    }
    if (target.indexOf('%20') !== -1) {
      return target.split('%20')[target.split('%20').length];
    }
    return target.substring(0, 24);
  } else if (target.length >= 20) {
    return target.substring(0, 46);
  }
  return target;
};

export const getAxesString = (key, model, type = null, shortened = true) => {
  const select = (ky, axis) => model.getIn([ky, 'searchString'], axis);
  const x = shortened ? shorten(model.get('axesxLabel', select(axg, 'X-Axis'))) : model.get('axesxLabel', select(axg, 'X-Axis'));
  const y = shortened ? shorten(model.get('axesyLabel', select(axv, 'Y-Axis')), false) : model.get('axesyLabel', select(axv, 'Y-Axis'));

  const getResultForXY = () => {
    const labelString = key === 'x' ? model.axesxLabel : model.axesyLabel;
    const defaultLabel = key === 'x' ? model.getIn(['axesxValue', 'searchString'], 'X-Axis') : model.getIn(['axesgroup', 'searchString'], 'Y-Axis');
    if (labelString && labelString.length) {
      return labelString;
    }
    return defaultLabel;
  };

  if (type === 'LEADERBOARD') {
    switch (key) {
      case 'x': return y.length ? y : model.getIn(['axesgroup', 'searchString'], 'X-Axis');
      case 'y': return x.length ? x : model.getIn(['axesvalue', 'searchString'], 'Y-Axis');
      default: return null;
    }
  }

  if (type !== 'XVSY') {
    switch (key) {
      case 'x': return x.length ? x : select(axg, 'yyyy/mm/dd');
      case 'y': return y.length ? y : select(axv, 'Y-Axis');
      default: return null;
    }
  }
  return getResultForXY();
};

const defaultSelector = (model, type, prefix, format = TEXT) => {
  const formattedDefault = () => {
    const select = key => model.getIn([key, 'searchString'], '');
    const addXY = (selectedX, selectedY = 'Time') => `X: ${startCase(toLower(selectedX))} Y: ${startCase(toLower(selectedY))}`;
    const addYX = (selectedX, selectedY = 'Time') => `X: ${startCase(toLower(selectedY))} Y: ${startCase(toLower(selectedX))}`;
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
