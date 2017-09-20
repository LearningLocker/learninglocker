import { fromJS } from 'immutable';

export const match = fromJS({
  $and: [
    {
      $comment: 'statement.actor',
      $or: [
        {
          'statement.actor.account.homePage': 'http://beta.curatr3.com',
          'statement.actor.account.name': '8713a88d-d994-41a0-a221-6f277e3cc212'
        },
        {
          'statement.actor.account.homePage': 'http://beta.curatr3.com',
          'statement.actor.account.name': 'b211485c-175f-470b-aaf3-ac6bddc0b8d2'
        }
      ]
    },
    {
      $comment: 'statement.context.revision',
      $or: [
        {
          'statement.context.revision': '5.0.7'
        }
      ]
    },
    {
      $comment: 'person',
      $or: [
        {
          'person._id': {
            $oid: '57555632ecf823f7307f50e6'
          }
        }
      ]
    }
  ]
});

export const resultCaches = fromJS({
  a: {
    _id: '573b1a5101e7fb60be7a2dfc',
    organisation: '56fbb868f1ec870140f0f9f8',
    values: [
      'My Learning Model Canvas',
      'Confessions of a late registerer',
      'Basic bar chart',
      'Gate to week 2'
    ],
    path: [
      'statement',
      'result',
      'extensions',
      'http://curatr3&46;com/define/extension/contribution-object',
      'definition',
      'name',
      'en-GB'
    ]
  },

  b: {
    _id: '573b1a5101e7fb60be7a2dfb',
    organisation: '56fbb868f1ec870140f0f9f8',
    values: [
      'Although I use a different framework, some raw info is mapped into the Learning Model Canvas, as required.',
      'Gamification element: Ranking parameters',
      '5 bars containing the number &#039;42&#039; at least once',
      '&#039;Getting started&#039;'
    ],
    path: [
      'statement',
      'result',
      'extensions',
      'http://curatr3&46;com/define/extension/contribution-object',
      'definition',
      'description',
      'en-GB'
    ]
  },

  c: {
    _id: '573b193f01e7fb60be7a2dfa',
    organisation: '56fbb868f1ec870140f0f9f8',
    values: [
      'http://beta.curatr3.com/badges/2191/Sergio-your-first-comment/assertion.json',
      'http://beta.curatr3.com/badges/2192/Jan-xapi-strategist/assertion.json',
      'http://beta.curatr3.com/badges/2193/Jan-xapi-anatomy/assertion.json',
      'http://beta.curatr3.com/badges/2194/Odd-your-first-comment/assertion.json'
    ],
    path: [
      'statement',
      'result',
      'extensions',
      'http://specification&46;openbadges&46;org/xapi/extensions/badgeassertion',
      '@id'
    ]
  },

  d: {
    _id: '573b190d01e7fb60be7a2df5',
    organisation: '56fbb868f1ec870140f0f9f8',
    values: [
      null
    ],
    path: [
      'statement',
      'result',
      'extensions'
    ]
  },

  // e: {
  //   '_id': '573b190d01e7fb60be7a2df3',
  //   'organisation': '56fbb868f1ec870140f0f9f8',
  //   'values': [
  //     null
  //   ],
  //   'path': [
  //     'statement',
  //     'result'
  //   ]
  // },

  f: {
    _id: '573b1a5101e7fb60be7a2dfe',
    organisation: '56fbb868f1ec870140f0f9f8',
    values: [
      'http://beta.curatr3.com/courses/xapi/home#object/12850',
      'http://beta.curatr3.com/courses/xapi/home#object/12853',
      'http://beta.curatr3.com/courses/xapi/home#object/12854',
      'http://beta.curatr3.com/courses/xapi/home#object/12855'
    ],
    path: [
      'statement',
      'result',
      'extensions',
      'http://curatr3&46;com/define/extension/contribution-object',
      'id'
    ]
  },

  g: {
    _id: '573b1a5101e7fb60be7a2dfd',
    organisation: '56fbb868f1ec870140f0f9f8',
    values: [
      'http://activitystrea.ms/schema/1.0/article'
    ],
    path: [
      'statement',
      'result',
      'extensions',
      'http://curatr3&46;com/define/extension/contribution-object',
      'definition',
      'type'
    ]
  }
});

export const duplicateSuggestions = fromJS({
  a: [{
    id: 'http://www.example.com/verb1',
    display: {
      'en-GB': 'Verb 1 Display 2'
    }
  }, {
    id: 'http://www.example.com/verb1',
    display: {
      'en-GB': 'Verb 1 Display 2'
    }
  }]
});
