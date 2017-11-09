import QueryBuilderCache from 'lib/models/querybuildercache';
import QueryBuilderCacheValue from 'lib/models/querybuildercachevalue';
import { map } from 'lodash';
import sha1 from 'sha1';

const updateQueryBuliderCache = async ({
  attributes,
  organisation
}) => {
  const createdAt = new Date();
  const updatedAt = createdAt;

  const pathBatch = QueryBuilderCache.collection.initializeUnorderedBulkOp();

  map(attributes, ((attribute) => {
    const doc = {
      organisation,
      path: [
        'persona',
        'import',
        attribute.key
      ],
      searchString: `persona.import.${attribute.key}`,
      valueType: 'String',
      createdAt,
      updatedAt
    };

    pathBatch.insert(doc);
  }));

  // --------------------

  const valueBatch = QueryBuilderCacheValue.collection.initializeUnorderedBulkOp();

  map(attributes, (attribute) => {
    const stringifyValue = JSON.stringify(attribute.value);
    const hash = stringifyValue.length > 40 ? sha1(stringifyValue) : stringifyValue;

    const doc = ({
      organisation,
      path: `persona.import.${attribute.key}`,
      hash,
      value: attribute.value,
      display: attribute.value,
      searchString: attribute.value,
      valueType: 'String',
      createdAt,
      updatedAt
    });
    valueBatch.insert(doc);
  });

  await Promise.all([valueBatch.execute({ w: 0 }), pathBatch.execute({ w: 0 })]);
};

export default updateQueryBuliderCache;
