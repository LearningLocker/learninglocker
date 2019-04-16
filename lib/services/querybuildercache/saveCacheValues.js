// import Promise from 'bluebird';
import { each } from 'lodash';
import sha1 from 'sha1';
import { SHOW } from 'lib/constants/recommendation';

const valueToSearchString = JSON.stringify;

export default function (caches, organisation, batch) {
  const createdAt = new Date();
  const updatedAt = createdAt;
  each(caches, (flatPath) => {
    const { path, value, fullValue, display } = flatPath;
    const searchString = valueToSearchString(fullValue);
    const stringifyValue = JSON.stringify(value);
    const hash = searchString.length > 40 ? sha1(stringifyValue) : stringifyValue;
    batch.find({
      organisation,
      path: path.join('.'),
      hash
    }).upsert()
    .update({
      $setOnInsert: {
        organisation,
        path: path.join('.'),
        hash,
        value,
        display,
        searchString,
        valueType: value && value.constructor.name,
        createdAt,
        updatedAt,

        recommendationWindowStart: new Date(),
        recommendationStatus: SHOW
      },
      $inc: {
        count: 1,
        recommendationWindowCount: 1
      }
    });
  });

  return batch;
}
