const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};
const COLORS = ['#E77E04', '#F6AB35', '#CD7228', '#006692', '#E73304'];

const colorCycle = (value) => {
  if (value > (COLORS.length - 1)) {
    return colorCycle(value - (COLORS.length));
  } else {
    return COLORS[value];
  }
  console.log('we here')
};

export default (value) => {
  return colorCycle(value);
};

