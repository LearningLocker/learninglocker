import _ from 'lodash';

const removeEmptyMatch = pipeline =>
   _.filter(pipeline, (stage) => {
     if (_.has(stage, '$match') && _.size(stage.$match) === 0) return false;
     return true;
   })
;

export default removeEmptyMatch;
