import React from 'react';
import VisualisationTypeIcon from '../containers/Visualise/VisualisationTypeIcon';
import uuid from 'uuid';

export const shorten = (shortening) => {
  if (shortening.length >= 20) {
    switch (true) {
      case shortening.indexOf(' ') !== -1: return shortening.split(' ')[0];
      case shortening.indexOf('.') !== -1: return shortening.split('.')[0];
      default: return shortening.substring(0, 24);
    }
  } else {
    return shortening;
  }
};

export const getLegend = (key, props) => {
  const x = shorten(props.model.get('axesxLabel', props.model.getIn(['axesgroup', 'searchString'], 'X-Axis')));
  const y = shorten(props.model.get('axesyLabel', props.model.getIn(['axesvalue', 'searchString'], 'Y-Axis')));
  switch (key) {
    case 'x': return x.length > 1 ? x : shorten(props.model.getIn(['axesgroup', 'searchString'], 'X-Axis'));
    case 'y': return y.length > 1 ? y : shorten(props.model.getIn(['axesvalue', 'searchString'], 'Y-Axis'));
    default: return null;
  }
};

export const createVisualisationName = (model, prefix) => {
  switch (model.get('type', 'Unnamed')) {
    case ('FREQUENCY'): return [<span key={uuid.v4()}>{prefix} </span>, <span  key={uuid.v4()} style={{ color: '#BFC7CD', fontWeight: '100', fontSize: '0.9em'}}>( X: {model.getIn(['axesvalue', 'searchString']) || model.getIn(['axesyValue','searchString'])} Y: Time )</span>];
    case ('XVSY'): return [<span key={uuid.v4()}>{prefix} </span>, <span  key={uuid.v4()} style={{ color: '#BFC7CD', fontWeight: '100', fontSize: '0.9em' }}>( X: {model.getIn(['axesxValue', 'searchString'])}   Y: {model.getIn(['axesvalue', 'searchString']) || model.getIn(['axesyValue', 'searchString'])} )</span>];
    case ('COUNTER'): return [<span key={uuid.v4()}>{prefix} </span>, <span  key={uuid.v4()} style={{ color: '#BFC7CD', fontWeight: '100', fontSize: '0.9em'}}>( {model.getIn(['axesvalue', 'searchString']) || model.getIn(['axesyValue','searchString'])} )</span>];
    case ('PIE'): return [<span key={uuid.v4()}>{prefix} </span>, <span  key={uuid.v4()} style={{ color: '#BFC7CD', fontWeight: '100', fontSize: '0.9em' }}>( {model.getIn(['axesvalue', 'searchString']) || model.getIn(['axesyValue', 'searchString'])} / {model.getIn(['axesgroup', 'searchString'])} )</span>];
    default: return [<span key={uuid.v4()}>{prefix} </span>, <span  key={uuid.v4()} style={{ color: '#BFC7CD', fontWeight: '100', fontSize: '0.9em' }}>( X: {model.getIn(['axesgroup', 'searchString'])}   Y: {model.getIn(['axesvalue', 'searchString']) || model.getIn(['axesyValue', 'searchString'])} )</span>];
  }
};

export const createVisualisationText = (model, prefix = '') => {
  if (model !== undefined) {
    switch (model.get('type', 'Unnamed')) {
      case ('FREQUENCY'): return `${prefix}X: ${model.getIn(['axesvalue', 'searchString'], '') || model.getIn(['axesyValue', 'searchString'], '')} Y: Time `;
      case ('XVSY'): return `${prefix}X: ${model.getIn(['axesxValue', 'searchString'], '')}  Y: ${model.getIn(['axesvalue', 'searchString'], '') || model.getIn(['axesyValue', 'searchString'], '')}`;
      case ('COUNTER'): return `${prefix} ${model.getIn(['axesvalue', 'searchString'], '') || model.getIn(['axesyValue', 'searchString'], '')}`;
      case ('PIE'): return `${prefix} ${model.getIn(['axesvalue', 'searchString'], '') || model.getIn(['axesyValue', 'searchString'], '')} / ${model.getIn(['axesgroup', 'searchString'], '')} `;
      default: return `${prefix} X: ${model.getIn(['axesgroup', 'searchString'], '')}   Y: ${model.getIn(['axesvalue', 'searchString'], '') || model.getIn(['axesyValue', 'searchString'], '')}`;
    }
  }
};

export const createDefaultTitleWithIcon = model => <span><VisualisationTypeIcon id={model.get('_id')} />{createVisualisationName(model)}</span>;

export const createDefaultTitle = (model, prefix) => createVisualisationText(model, prefix);

export const getPercentage = (res1, res2) => {
  const newValue = res1 || 0;
  const oldValue = res2 || 0;
  const percentage = parseInt(Math.round((oldValue - newValue) / newValue) * 100);
  let formattedResult;
  switch (true) {
    case percentage === Infinity || isNaN(percentage) : formattedResult = { result: 'N/A', color: '#9BA5AB' }; break;
    case percentage < 0 : formattedResult = { result: `${percentage}%`, color: '#E73304' }; break;
    default: formattedResult = { result: `+${percentage}%`, color: '#23A17E' }; break;
  }
  return formattedResult;
};
