import mdiff from 'mdiff';
import { List } from 'immutable';
import { FORWARD, BACKWARD } from './fetchModels';

const diffEdges = (
  inputEdges,
  oldEdges,
  cursor,
  pageInfo,
  direction = FORWARD
) => {
  const inRaw = inputEdges.toJS();

  let inList = inputEdges.toList();
  if (cursor !== undefined) {
    if (direction === FORWARD) {
      inRaw.unshift({ cursor });
      inList = inList.unshift(undefined);
    } else if (direction === BACKWARD) {
      inRaw.push({ cursor });
      inList = inList.push(undefined);
    }
  }

  const outRaw = oldEdges.toJS();
  let out = oldEdges.toList();

  if (
    !pageInfo.get('hasNextPage') && !pageInfo.get('hasPreviousPage') &&
    inputEdges.size === 0
  ) {
    return new List();
  }

  const diff = mdiff(inRaw, outRaw, {
    equal: (valueA, valueB) => (valueA.cursor === valueB.cursor)
  });

  let inc = 0;

  diff.scanDiff((aStart, aEnd, bStart, bEnd) => {
    const toInsert = inList.slice(aStart, aEnd)
      .filter(item => item !== undefined);

    if (aStart === 0 && bStart === 0 && bEnd === outRaw.length) {
      // if nothing matches, append new result
      if (direction === FORWARD) {
        out = out.splice(inc + bEnd, 0, ...toInsert);
      } else if (direction === BACKWARD) {
        out = out.splice(0, 0, ...toInsert);
      }
      const toInc = toInsert.size;
      inc += toInc;
    } else if (
      aStart === aEnd &&
      aEnd === inRaw.length &&
      pageInfo.get('hasNextPage', true) &&
      direction === FORWARD
    ) {
      // if the new collection doesn't contain the end, don't delete the end.
    } else if (
      aStart === aEnd &&
      aEnd === inRaw.length &&
      pageInfo.get('hasPreviousPage', true) &&
      direction === BACKWARD &&
      cursor !== undefined
    ) {
      // if the collection doesn't contain the 'end', don't delete the end.
    } else if (
      aStart === 0 &&
      aEnd === 0 &&
      cursor !== undefined &&
      direction === FORWARD
    ) {
      /*
        in: [2, 3] out: [1, 2, 3], will try to insert [] in place of [1]
        this block stops that.
      */
    } else if (aStart === 0 && aEnd === 0 && aEnd === inRaw.length) {
      // match failed, do nothing
    } else if (
      aEnd === inRaw.length &&
      pageInfo.get('hasNextPage', true) &&
      direction === FORWARD
    ) {
      /*
      in: [4, 5.5], out => [3, 4, 5, 6, 7].
      as nothing matches after 5.5, without this block, it'll try and replace [5,6,7]
      */
      out = out.splice(inc + bStart, 0, ...toInsert);
      inc += toInsert.size;
    } else if (
      aStart === 0 &&
      bStart === 0 && // trying to replace some begining
      bEnd !== 0 &&
      pageInfo.get('hasPreviousPage', true) &&
      direction === BACKWARD
    ) {
      /*
        direction backwards
        in: [2.5, 2, 3], out [1, 2, 3], will insert 2.5 at between 1 & 2
      */
      out = out.splice(inc + bEnd, 0, ...toInsert);
      inc += toInsert.size;
    } else {
      out = out.splice(inc + bStart, bEnd - bStart, ...toInsert);
      const toInc = toInsert.size - (bEnd - bStart);
      inc += toInc;
    }
  });

  return out.toOrderedSet();
};

export default diffEdges;
