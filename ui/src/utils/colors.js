const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};
// eslint-disable-next-line no-case-declarations
const COLORS = ['#E77E04', '#F6AB35', '#CD7228', '#006692', '#E73304'];

const colorCycle = (value) => {
  if (value > (COLORS.length - 1)) {
    return colorCycle(value - (COLORS.length));
  }
  return COLORS[value];
};

export default ({
  hexColor = '#f5d76e',
  range,
  value,
  minOpacity = 0.2,
  maxOpacity = 1,
  shading = 'opacity'
}) => {
  if (shading === 'opacity') {
    const rgb = hexToRgb(hexColor);
    const opacityRange = maxOpacity - minOpacity;
    const opacityInterval = (range > 1 ? opacityRange / (range - 1) : opacityRange);
    const opacity = (opacityInterval * value) + minOpacity;
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`;
  }
  if (shading === 'colors') {
    return colorCycle(value);
  }

  return null;
};

