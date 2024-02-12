import { ObjectId } from 'mongodb';
import QueryBuilderCache from 'lib/models/querybuildercache';
import QueryBuilderCacheValue from 'lib/models/querybuildercachevalue';
import { map } from 'lodash';
import sha1 from 'sha1';

const updateQueryBuilderCache = async ({
  attributes,
  organisation
}) => {
  const orgId = new ObjectId(organisation);
  const createdAt = new Date();
  const updatedAt = createdAt;

  const pathBatch = QueryBuilderCache.collection.initializeUnorderedBulkOp();

  map(attributes, ((attribute) => {
    const doc = {
      organisation: orgId,
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
      organisation: orgId,
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

  const batches = [];
  if (
    valueBatch && valueBatch.s && valueBatch.s.currentBatch
    && valueBatch.s.currentBatch.operations
    && valueBatch.s.currentBatch.operations.length > 0
  ) {
    batches.push(valueBatch);
  }

  if (
    pathBatch && pathBatch.s && pathBatch.s.currentBatch
    && pathBatch.s.currentBatch.operations
    && pathBatch.s.currentBatch.operations.length > 0
  ) {
    batches.push(pathBatch);
  }

  await Promise.all([map(batches, batch => batch.execute({ w: 0 }))]);
};

export default updateQueryBuilderCache;
