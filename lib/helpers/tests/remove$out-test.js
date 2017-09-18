/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import remove$out from 'lib/helpers/remove$out';

describe('remove$out helper test', () => {
  const pipeline = [
    {
      $match: {
        $and: [
          {
            $comment: 'statement.actor',
            $or: [
              {
                'statement.actor.account.homePage': 'http://rachel.biz',
                'statement.actor.account.name': 'f7c39396-d56f-42aa-848d-ebe0c875ca53'
              }
            ]
          },
          {
            $comment: 'statement.verb',
            $or: [
              {
                'statement.verb.id': 'http://fak.er/verb/maximized'
              }
            ]
          },
          {
            $comment: 'statement.object',
            $or: [
              {
                'statement.object.id': 'http://fak.er/object/deliverables'
              }
            ]
          },
          {
            $comment: 'statement.context.platform',
            $or: [
              {
                'statement.context.platform': 'http://www.example.com'
              }
            ]
          },
        ]
      }
    },
    {
      $sort: {
        timestamp: -1
      }
    },
    { $out: 'authors' }
  ];

  const pipelineNoOut = [
    {
      $match: {
        $and: [
          {
            $comment: 'statement.actor',
            $or: [
              {
                'statement.actor.account.homePage': 'http://rachel.biz',
                'statement.actor.account.name': 'f7c39396-d56f-42aa-848d-ebe0c875ca53'
              }
            ]
          },
          {
            $comment: 'statement.verb',
            $or: [
              {
                'statement.verb.id': 'http://fak.er/verb/maximized'
              }
            ]
          },
          {
            $comment: 'statement.object',
            $or: [
              {
                'statement.object.id': 'http://fak.er/object/deliverables'
              }
            ]
          },
          {
            $comment: 'statement.context.platform',
            $or: [
              {
                'statement.context.platform': 'http://www.example.com'
              }
            ]
          },
        ]
      }
    },
    {
      $sort: {
        timestamp: -1
      }
    }
  ];

  it('should remove $out from a pipeline that contains it', () => {
    const result = remove$out(pipeline);
    expect(result).to.deep.equal(pipelineNoOut);
  });

  it('should not modify a pipeline that doesn\'t contain it', () => {
    const result = remove$out(pipelineNoOut);
    expect(result).to.deep.equal(pipelineNoOut);
  });
});
