const isContextActivity = (groupType) => {
  if (typeof groupType !== 'string') {
    return false;
  }
  const a = groupType.split('.');
  return a.length === 4 &&
    a[0] === 'statement' &&
    a[1] === 'context' &&
    a[2] === 'contextActivities' &&
    ['grouping', 'category', 'other', 'parent'].includes(a[3]);
};

export default isContextActivity;
