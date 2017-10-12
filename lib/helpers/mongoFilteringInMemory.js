/* eslint-disable no-use-before-define */
import sift from 'sift';

sift.use({
  $comment: () => true
});

const match = filter => actual => sift(filter, [actual]).length > 0;

export default match;
