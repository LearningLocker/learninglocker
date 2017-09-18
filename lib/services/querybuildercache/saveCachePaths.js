import { each } from 'lodash';

export default function (caches, organisation, batch) {
  const createdAt = new Date();
  const updatedAt = createdAt;
  each(caches, (flatPath) => {
    each(flatPath.path.slice(0, -1), (item, i) => {
      const subPath = flatPath.path.slice(0, (i + 1));
      const data = {
        organisation,
        path: subPath,
        searchString: subPath.join('.'),
        // valueType: null,
        createdAt,
        updatedAt
      };
      batch.insert(data);
    });

    const data = {
      organisation,
      path: flatPath.path,
      searchString: flatPath.path.join('.'),
      valueType: flatPath.value && flatPath.value.constructor.name,
      createdAt,
      updatedAt
    };

    batch.insert(data);
  });

  return batch;
}
