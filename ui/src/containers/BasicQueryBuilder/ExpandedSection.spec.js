import { fromJS } from 'immutable';
import { queryBuilderCacheFilterGenerator } from './ExpandedSection';

test('BasicQueryBuilder ExpandedSection Should generate query from childGenerators', () => {
  const section = fromJS({
    childGenerators: [{
      path: ['statement', 'context', 'extensions']
    }]
  });

  const query = queryBuilderCacheFilterGenerator({ section });

  expect(query.queryBuilderCacheFilter.$and[0].$or[0]['path.0'].$eq).toEqual('statement');
  expect(query.queryBuilderCacheFilter.$and[0].$or[0]['path.1'].$eq).toEqual('context');
  expect(query.queryBuilderCacheFilter.$and[0].$or[0]['path.2'].$eq).toEqual('extensions');

  expect(query.queryBuilderCacheFilter.$and[1].path.$size).toEqual(4);
});

test('BasicQueryBuilder ExpandedSection Should generate query from path', () => {
  const section = fromJS({
    keyPath: ['statement', 'context', 'extensions']
  });

  const query = queryBuilderCacheFilterGenerator({ section });

  console.log('query', JSON.stringify(query.queryBuilderCacheFilter));

  expect(query.queryBuilderCacheFilter.$and[0].$and[0]['path.0'].$eq).toEqual('statement');
  expect(query.queryBuilderCacheFilter.$and[0].$and[1]['path.1'].$eq).toEqual('context');
  expect(query.queryBuilderCacheFilter.$and[0].$and[2]['path.2'].$eq).toEqual('extensions');

  expect(query.queryBuilderCacheFilter.$and[1].path.$size).toEqual(4);
});
