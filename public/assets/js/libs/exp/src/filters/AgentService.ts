import BaseService = require('../commons/BaseService');
import AggregationRepo = require('../commons/AggregationRepo');

class Service extends BaseService {
  private result: Array<Object> = [];
  private repo: AggregationRepo;

  constructor(repo: AggregationRepo) {
    super();
    this.repo = repo;
  }

  public getResult() {
    return this.result;
  }

  public update(match_pipe: any, search: string) {
    var pipeline = this.pipeline(match_pipe, search);

    return this.repo.update(pipeline).then(function (data) {
      this.result = data.result;
      this.emitChange();
    }.bind(this), function (response, status, error) {
      console.error(response);
      alert(error);
    });
  }

  private pipeline(match_pipe: any, search: string) {
    match_pipe.active = true;
    match_pipe.voided = false;
    return [
      {'$match': {
        '$and': [{
          '$or': [{
            'statement.actor.name': {'$regex': search, '$options': 'i'}
          }, {
            'statement.actor.mbox': {'$regex': search, '$options': 'i'}
          }, {
            'statement.actor.openid': {'$regex': search, '$options': 'i'}
          }, {
            'statement.actor.mbox_sha1sum': {'$regex': search, '$options': 'i'}
          }, {
            'statement.actor.account.name': {'$regex': search, '$options': 'i'}
          }]
        }, match_pipe]
      }},
      {'$group': {
        '_id': {
          'mbox': '$statement.actor.mbox',
          'openid': '$statement.actor.openid',
          'mbox_sha1sum': '$statement.actor.mbox_sha1sum',
          'account_name': '$statement.actor.account.name',
          'account_homePage': '$statement.actor.account.homePage'
        },
        'count': {'$sum': 1},
        'name': {'$first': '$statement.actor.name'}
      }},
      {'$sort': {
        'count': 1
      }},
      {'$project': {
        '_id': 1,
        'name': 1
      }}
    ];
  }
}

export = Service;
