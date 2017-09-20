export default format => ({
  $dateToString: { format, date: '$timestamp' }
});
