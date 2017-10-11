import { fromJS, OrderedMap, OrderedSet, Map } from 'immutable';
import { IN_PROGRESS, COMPLETED } from 'ui/utils/constants';
import {
  reduceStart,
  reduceSuccess,
  idsByFilterSelector,
  actions,
} from './fetchModels';

test('reduceStart with no cursor should set currentCursor to undefined and requestState to IN_PROGRESS', () => {
  const mockState = fromJS({});

  const newState = reduceStart(mockState, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort'
  });

  expect(newState.getIn(['user', 'filter', 'sort', 'pageInfo', 'currentCursor'])).toEqual(undefined);
  expect(newState.getIn(['user', 'filter', 'sort', undefined, 'requestState'])).toEqual(IN_PROGRESS);
});

test('reduceSuccess (undefined: [1, 2, 3]) should update state', () => {
  const mockState = fromJS({});

  const newState = reduceSuccess(mockState, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    ids: [1, 2, 3],
    pageInfo: new OrderedMap({
      page: 1
    }),
    edges: new OrderedSet([
      new OrderedMap({
        id: 1,
        cursor: 'a'
      }),
      new OrderedMap({
        id: 2,
        cursor: 'b'
      }),
      new OrderedMap({
        id: 3,
        cursor: 'c'
      })
    ])
  });

  expect(newState.getIn(['user', 'filter', 'sort', 'pageInfo', 'page'])).toEqual(1);
  expect(newState.getIn(['user', 'filter', 'sort', undefined, 'requestState'])).toEqual(COMPLETED);

  expect(newState.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS()).toEqual([1, 2, 3]);
});

test('reduceSuccess (undefined: [1, 2, 3]) and reduceSuccess (undefined: [1, 3, 4]) should produce [1, 3, 4]', () => {
  const mockState = fromJS({});
  const newState = reduceSuccess(mockState, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    ids: [1, 2, 3],
    edges: new OrderedSet([
      new OrderedMap({
        id: 1,
        cursor: 'a'
      }),
      new OrderedMap({
        id: 2,
        cursor: 'b'
      }),
      new OrderedMap({
        id: 3,
        cursor: 'c'
      })
    ]),
    pageInfo: new OrderedMap({
      page: 1
    })
  });
  const newState2 = reduceSuccess(newState, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    ids: [1, 3, 4],
    edges: new OrderedSet([
      new OrderedMap({
        id: 1,
        cursor: 'a'
      }),
      new OrderedMap({
        id: 3,
        cursor: 'c'
      }),
      new OrderedMap({
        id: 4,
        cursor: 'd'
      })
    ]),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(newState2.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS()).toEqual([1, 3, 4]);
});

test('selecting from state (undefined: [1, 2, 3]) should produce [1, 2, 3]', () => {
  const mockState = fromJS({
  });

  const newState = reduceSuccess(mockState, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    ids: [1, 2, 3],
    edges: new OrderedSet([
      new OrderedMap({
        cursor: 'a',
        id: 1
      }),
      new OrderedMap({
        cursor: 'b',
        id: 2
      }),
      new OrderedMap({
        cursor: 'c',
        id: 3
      })
    ]),
    pageInfo: new OrderedMap({
      page: 1
    })
  });
  const nestedState = { pagination: newState };

  const result = idsByFilterSelector('user', 'filter', 'sort')(nestedState);

  expect(result.toJS()).toEqual([1, 2, 3]);
});

test('idsByFilterSelector on [1, 2, 3]', () => {
  const edges = new OrderedSet([
    new OrderedMap({
      cursor: 'a',
      id: 1
    }),
    new OrderedMap({
      cursor: 'b',
      id: 2
    }),
    new OrderedMap({
      cursor: 'c',
      id: 3
    })
  ]);

  const mockState = {
    pagination: fromJS({
      user: {
        filter: {
          sort: {
            edges
          }
        }
      }
    })
  };

  const result = idsByFilterSelector('user', 'filter', 'sort')(mockState);

  expect(result.toJS()).toEqual([1, 2, 3]);
});

const setupEdges = ids =>
  (ids.map((id) => {
    const cursor = `c${id}`;
    return new OrderedMap({
      id,
      cursor
    });
  }));

const setupMockState = (ids) => {
  const edges = setupEdges(ids);

  return {
    pagination: fromJS({
      user: {
        filter: {
          sort: {
            edges
          }
        }
      }
    })
  };
};

// /////////////////////////////////////////////////////////////////

test('reduceSuccess add to begining', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    edges: setupEdges([-1, 1, 2]),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([-1, 1, 2, 3]);
});

test('reduceSuccess add to begining, direction: BACKWARD', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'BACKWARD',
    edges: setupEdges([-3, -2, -1]),
    cursor: new Map({ before: 'c1' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([-3, -2, -1, 1, 2, 3]);
});

test('reduceSuccess add to end', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    edges: setupEdges([2, 3, 4]),
    cursor: new Map({ after: 'c1' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([1, 2, 3, 4]);
});

test('reduceSuccess add to end, direction: BACKWARD', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'BACKWARD',
    edges: setupEdges([-1, 1, 2]),
    cursor: new Map({ before: 'c3' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([-1, 1, 2, 3]);
});

test('reduceSuccess add middle from end', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    edges: setupEdges([2, 3, 4.5]),
    cursor: new Map({ after: 'c1' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([1, 2, 3, 4.5, 4, 5]);
});

test('reduceSuccess add middle from end, direction: BACKWARD', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'BACKWARD',
    edges: setupEdges([2.5, 3, 4]),
    cursor: new Map({ before: 'c5' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([1, 2, 2.5, 3, 4, 5]);
});

test('reduceSuccess add to middle', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    edges: setupEdges([3, 3.5, 4]),
    cursor: new Map({ after: 'c2' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([1, 2, 3, 3.5, 4, 5]);
});

test('reduceSuccess add to middle BACKWARD', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'BACKWARD',
    edges: setupEdges([3, 3.5, 4]),
    cursor: new Map({ before: 'c5' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([1, 2, 3, 3.5, 4, 5]);
});

test('reduceSuccess add to middle from start', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    edges: setupEdges([2.5, 3, 4]),
    cursor: new Map({ after: 'c2' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([1, 2, 2.5, 3, 4, 5]);
});

test('reduceSuccess add to middle from start BACKWARD', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'BACKWARD',
    edges: setupEdges([3, 4, 4.5]),
    cursor: new Map({ before: 'c5' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([1, 2, 3, 4, 4.5, 5]);
});

test('reduceSuccess delete from begining', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    edges: setupEdges([2, 3, 4]),
    cursor: undefined,
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([2, 3, 4, 5]);
});

test('reduceSuccess delete from begining BACKWARD', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'BACKWARD',
    edges: setupEdges([2, 3, 4]),
    cursor: undefined,
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([1, 2, 3, 4]);
});

test('reduceSuccess delete from middle', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    edges: setupEdges([2, 4, 5]),
    cursor: new Map({ after: 'c1' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([1, 2, 4, 5]);
});

test('reduceSuccess delete from middle BACKWARD', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'BACKWARD',
    edges: setupEdges([2, 4, 5]),
    cursor: new Map({ before: 'c6' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([1, 2, 4, 5]);
});

test('reduceSuccess delete from end', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    edges: setupEdges([2, 3, 4]),
    cursor: new Map({ before: 'c1' }),
    pageInfo: new OrderedMap({
      page: 1,
      hasNextPage: false
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([1, 2, 3, 4]);
});

test('reduceSuccess delete from end BACKWARD', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'BACKWARD',
    edges: setupEdges([2, 3, 4]),
    cursor: new Map({ after: 'c5' }),
    pageInfo: new OrderedMap({
      page: 1,
      hasPreviousPage: false
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([2, 3, 4, 5]);
});

test('multi add', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    edges: setupEdges([2, 2.5, 3, 3.5, 4]),
    cursor: new Map({ after: 'c1' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([1, 2, 2.5, 3, 3.5, 4, 5]);
});

test('multi add BACKWARD', () => {
  const mockState = setupMockState(new OrderedSet([1, 2, 3, 4, 5]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'BACKWARD',
    edges: setupEdges([2, 2.5, 3, 3.5, 4]),
    cursor: new Map({ before: 'c5' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges']).map(item => item.get('id')).toJS())
    .toEqual([1, 2, 2.5, 3, 3.5, 4, 5]);
});

test('empty state', () => {
  const mockState = setupMockState(new OrderedSet([1]));

  const result = reduceSuccess(mockState.pagination, {
    schema: 'user',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    edges: setupEdges([]),
    cursor: new Map({ after: 'undefined' }),
    pageInfo: new OrderedMap({
      page: 1
    })
  });

  expect(result.getIn(['user', 'filter', 'sort', 'edges'])
    .map(item => item.get('id')).toJS())
    .toEqual([]);
});

// //////////////////////////////////////

test('fetchAllOutstandingModels', () => {
  expect.assertions(1);

  const mockState = {
    pagination: fromJS({
      schema: {
        filter: {
          sort: {
            edges: new OrderedSet([
              new OrderedMap({
                id: '1',
                cursor: 'c1'
              }), new OrderedMap({
                id: '2',
                cursor: 'c2'
              })
            ])
          }
        }
      }
    })
  };

  const mockGetState = () => mockState;

  const mockFetchModelsStart = jest.fn();

  const mockDisptach = () => {
    let newState;

    if (mockFetchModelsStart.mock.calls.length === 1) {
      newState = {
        pageInfo: new OrderedMap({
          hasNextPage: true
        }),
        edges: [new OrderedMap({
          id: '1',
          cursor: 'c1'
        })]
      };
    } else {
      newState = {
        pageInfo: new OrderedMap({
          hasNextPage: false
        }),
        edges: [new OrderedMap({
          id: '5',
          cursor: 'c5'
        })]
      };
    }

    return Promise.resolve(
      newState
    );
  };

  const result = (actions.fetchAllOutstandingModels({
    schema: 'schema',
    filter: 'filter',
    sort: 'sort',
    direction: 'FORWARD',
    cursor: undefined,
    fetchModelsStart: mockFetchModelsStart
  })(mockDisptach, mockGetState));

  return result.then(() => {
    expect(mockFetchModelsStart.mock.calls.length).toEqual(2);
  });
});
