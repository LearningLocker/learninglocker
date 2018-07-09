import React from 'react';
import VisualisationTypeIcon from '../containers/Visualise/VisualisationTypeIcon';

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
    case ('FREQUENCY'): return [<span>{prefix} </span>, <span style={{ color: '#BFC7CD', fontWeight: '100', fontSize: '0.9em'}}>( X: {model.getIn(['axesvalue', 'searchString']) || model.getIn(['axesyValue','searchString'])} Y: Time )</span>];
    case ('XVSY'): return [<span>{prefix} </span>, <span style={{ color: '#BFC7CD', fontWeight: '100', fontSize: '0.9em' }}>( X: {model.getIn(['axesxValue', 'searchString'])}   Y: {model.getIn(['axesvalue', 'searchString']) || model.getIn(['axesyValue', 'searchString'])} )</span>];
    case ('COUNTER'): return [<span>{prefix} </span>, <span style={{ color: '#BFC7CD', fontWeight: '100', fontSize: '0.9em'}}>( {model.getIn(['axesvalue', 'searchString']) || model.getIn(['axesyValue','searchString'])} )</span>];
    default: return [<span>{prefix} </span>, <span style={{ color: '#BFC7CD', fontWeight: '100', fontSize: '0.9em' }}>( X: {model.getIn(['axesgroup', 'searchString'])}   Y: {model.getIn(['axesvalue', 'searchString']) || model.getIn(['axesyValue', 'searchString'])} )</span>];
  }
};

export const createVisualisationText = (model, prefix = '') => {
  if (model !== undefined) {
    switch (model.get('type', 'Unnamed')) {
      case ('FREQUENCY'): return `${prefix}X: ${model.getIn(['axesvalue', 'searchString'], '') || model.getIn(['axesyValue', 'searchString'], '')} Y: Time `;
      case ('XVSY'): return `${prefix}X: ${model.getIn(['axesxValue', 'searchString'], '')}  Y: ${model.getIn(['axesvalue', 'searchString'], '') || model.getIn(['axesyValue', 'searchString'], '')}`;
      case ('COUNTER'): return `${prefix} ${model.getIn(['axesvalue', 'searchString'], '') || model.getIn(['axesyValue', 'searchString'], '')}`;
      default: return `${prefix} X: ${model.getIn(['axesgroup', 'searchString'], '')}   Y: ${model.getIn(['axesvalue', 'searchString'], '') || model.getIn(['axesyValue', 'searchString'], '')}`;
    }
  }
};

export const createDefaultTitleWithIcon = model => <span><VisualisationTypeIcon id={model.get('_id')} />{createVisualisationName(model)}</span>;

export const createDefaultTitle = (model, prefix) => createVisualisationText(model, prefix);

