export const shorten = (shortening) => {
  console.log('short',shortening)
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
}


